import type { StoredPayload } from '@/lib/types/normalize-payload'
import { normalizePayload } from '@/lib/types/normalize-payload'
import { createSupabaseAdmin, createSupabasePublic } from '@/lib/supabase/server'

export type PaymentStatus = 'free' | 'pending' | 'paid' | 'failed'

export interface SurpriseRow {
  id: string
  slug: string
  template: string
  tier: string
  payload: StoredPayload
  status: string
  payment_status: PaymentStatus
  price_paid: number | null
  stripe_session_id: string | null
  created_at: string
}

export async function getSurpriseBySlug(slug: string): Promise<SurpriseRow | null> {
  const supabase = createSupabasePublic()

  const { data, error } = await supabase
    .from('surprises')
    .select(
      'id, slug, template, tier, payload, status, payment_status, price_paid, stripe_session_id, created_at'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) return null

  const payload = normalizePayload(data.payload, data.template)
  if (!payload) return null

  return {
    ...data,
    payload,
    tier: data.tier ?? payload.tier ?? 'basic',
    payment_status: (data.payment_status as PaymentStatus) ?? 'free',
    price_paid: data.price_paid ?? null,
    stripe_session_id: data.stripe_session_id ?? null,
  }
}

export async function getSurpriseBySlugAdmin(slug: string): Promise<SurpriseRow | null> {
  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('surprises')
    .select(
      'id, slug, template, tier, payload, status, payment_status, price_paid, stripe_session_id, created_at'
    )
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null

  const payload = normalizePayload(data.payload, data.template)
  if (!payload) return null

  return {
    ...data,
    payload,
    tier: data.tier ?? payload.tier ?? 'basic',
    payment_status: (data.payment_status as PaymentStatus) ?? 'free',
    price_paid: data.price_paid ?? null,
    stripe_session_id: data.stripe_session_id ?? null,
  }
}

export async function insertSurprise(
  slug: string,
  template: string,
  tier: string,
  payload: StoredPayload,
  options?: {
    status?: 'draft' | 'published'
    paymentStatus?: PaymentStatus
    stripeSessionId?: string
    pricePaid?: number
  }
): Promise<{ slug: string } | { error: string }> {
  const supabase = createSupabaseAdmin()

  const status = options?.status ?? 'published'
  const paymentStatus = options?.paymentStatus ?? (status === 'published' ? 'free' : 'pending')

  const { error } = await supabase.from('surprises').insert({
    slug,
    template,
    tier,
    payload,
    status,
    payment_status: paymentStatus,
    price_paid: options?.pricePaid ?? null,
    stripe_session_id: options?.stripeSessionId ?? null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Slug već postoji, pokušaj ponovo.' }
    }
    return { error: error.message }
  }

  return { slug }
}

export async function updateSurpriseCheckout(
  slug: string,
  stripeSessionId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = createSupabaseAdmin()

  const { error } = await supabase
    .from('surprises')
    .update({
      stripe_session_id: stripeSessionId,
      payment_status: 'pending',
    })
    .eq('slug', slug)

  if (error) return { error: error.message }
  return { ok: true }
}

export async function publishSurprisePayment(
  slug: string,
  pricePaid: number | null
): Promise<{ ok: true } | { error: string }> {
  const supabase = createSupabaseAdmin()

  const { error } = await supabase
    .from('surprises')
    .update({
      status: 'published',
      payment_status: 'paid',
      price_paid: pricePaid,
    })
    .eq('slug', slug)

  if (error) return { error: error.message }
  return { ok: true }
}

export async function markSurprisePaymentFailed(slug: string): Promise<void> {
  const supabase = createSupabaseAdmin()
  await supabase
    .from('surprises')
    .update({ payment_status: 'failed' })
    .eq('slug', slug)
}

export async function uploadSurprisePhoto(
  file: File,
  slug: string,
  index: number
): Promise<{ url: string } | { error: string }> {
  const supabase = createSupabaseAdmin()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${slug}/${index}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from('surprise-photos').upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    return { error: error.message }
  }

  const { data } = supabase.storage.from('surprise-photos').getPublicUrl(path)
  return { url: data.publicUrl }
}
