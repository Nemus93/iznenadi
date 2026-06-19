import { createSupabaseAdmin } from '@/lib/supabase/server'
import {
  formatSmsLink,
  formatSmsTeaser,
  isSmsConfigured,
  sendSms,
} from '@/lib/sms'
import { getSurpriseUrl } from '@/lib/slug'
import type { PhoneNotification } from '@/lib/types/unlock-phone-types'

const SMS_INTERVAL_MS = 45_000

export interface NotificationJobRow {
  id: string
  surprise_id: string
  sequence_index: number
  body: string
  scheduled_at: string
  status: string
  provider_message_id: string | null
  error: string | null
}

export function buildSmsJobBodies(
  notifications: PhoneNotification[],
  slug: string,
  senderName: string
): string[] {
  const link = getSurpriseUrl(slug)
  const teasers = notifications.map((n) =>
    formatSmsTeaser(n.title, n.body, senderName)
  )
  teasers.push(formatSmsLink(link, senderName))
  return teasers
}

export async function scheduleNotificationJobs(
  surpriseId: string,
  recipientPhone: string,
  notifications: PhoneNotification[],
  slug: string,
  senderName: string,
  startAt: Date
): Promise<{ ok: true } | { error: string }> {
  const supabase = createSupabaseAdmin()
  const bodies = buildSmsJobBodies(notifications, slug, senderName)

  const rows = bodies.map((body, sequence_index) => ({
    surprise_id: surpriseId,
    sequence_index,
    body,
    scheduled_at: new Date(startAt.getTime() + sequence_index * SMS_INTERVAL_MS).toISOString(),
    status: isSmsConfigured() ? 'pending' : 'skipped',
    error: isSmsConfigured() ? null : 'Twilio nije konfigurisan',
  }))

  const { error } = await supabase.from('notification_jobs').insert(rows)
  if (error) return { error: error.message }

  await supabase
    .from('surprises')
    .update({ recipient_phone: recipientPhone })
    .eq('id', surpriseId)

  return { ok: true }
}

export async function processPendingNotificationJobs(
  limit = 20
): Promise<{ processed: number; sent: number; failed: number }> {
  const supabase = createSupabaseAdmin()
  const now = new Date().toISOString()

  const { data: jobs, error } = await supabase
    .from('notification_jobs')
    .select('id, surprise_id, body, status, sequence_index')
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (error || !jobs?.length) {
    return { processed: 0, sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const job of jobs) {
    const { data: surprise } = await supabase
      .from('surprises')
      .select('recipient_phone')
      .eq('id', job.surprise_id)
      .maybeSingle()

    const phone = surprise?.recipient_phone
    if (!phone) {
      await supabase
        .from('notification_jobs')
        .update({ status: 'failed', error: 'Nema broja primaoca' })
        .eq('id', job.id)
      failed++
      continue
    }

    if (!isSmsConfigured()) {
      await supabase
        .from('notification_jobs')
        .update({ status: 'skipped', error: 'Twilio nije konfigurisan' })
        .eq('id', job.id)
      continue
    }

    const result = await sendSms(phone, job.body)
    if ('error' in result) {
      await supabase
        .from('notification_jobs')
        .update({ status: 'failed', error: result.error })
        .eq('id', job.id)
      failed++
    } else {
      await supabase
        .from('notification_jobs')
        .update({
          status: 'sent',
          provider_message_id: result.sid,
          error: null,
        })
        .eq('id', job.id)
      sent++
    }
  }

  return { processed: jobs.length, sent, failed }
}
