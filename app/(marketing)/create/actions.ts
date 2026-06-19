'use server'

import {
  createFormSchema,
  formValuesToPayload,
  loveMessagePayloadSchema,
  type Tier,
} from '@/lib/types/surprise'
import {
  quizCreateFormSchema,
  quizFormValuesToPayload,
  secretQuizPayloadSchema,
} from '@/lib/types/secret-quiz'
import {
  phoneCreateFormSchema,
  phoneFormValuesToPayload,
  unlockPhonePayloadSchema,
} from '@/lib/types/unlock-phone'
import {
  countdownCreateFormSchema,
  countdownFormToPayload,
  countdownPayloadSchema,
} from '@/lib/types/countdown'
import { tierRequiresPayment } from '@/lib/billing'
import { getMaxPhotos, getTemplate } from '@/lib/templates/registry'
import { generateSurpriseSlug } from '@/lib/slug'
import { createCheckoutSession } from '@/lib/stripe'
import { scheduleNotificationJobs } from '@/lib/notification-jobs'
import { normalizePhoneE164 } from '@/lib/sms'
import {
  insertSurprise,
  updateSurpriseCheckout,
  uploadSurprisePhoto,
} from '@/lib/surprises'
import { isSupabaseConfigured } from '@/lib/supabase/server'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export type CreateSurpriseResult =
  | { slug: string }
  | { checkoutUrl: string; slug: string }
  | { error: string }

export async function createSurpriseAction(
  formData: FormData
): Promise<CreateSurpriseResult> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        'Supabase nije konfigurisan. Kopiraj .env.example u .env.local i pokreni migraciju.',
    }
  }

  const raw = formData.get('payload')
  if (typeof raw !== 'string') {
    return { error: 'Neispravni podaci forme.' }
  }

  const templateId = formData.get('template')
  const tierRaw = formData.get('tier')

  if (typeof templateId !== 'string' || typeof tierRaw !== 'string') {
    return { error: 'Nedostaje template ili nivo.' }
  }

  const template = getTemplate(templateId)
  if (!template?.available) {
    return { error: 'Izabrani template nije dostupan.' }
  }

  const tier = tierRaw as Tier
  const tierOption = template.tiers.find((t) => t.tier === tier)
  if (!tierOption) {
    return { error: 'Izabrani nivo nije dostupan za ovaj template.' }
  }

  const maxPhotos = getMaxPhotos(tier)
  const files = formData.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)
  const minPhotos = templateId === 'countdown' ? 0 : 1

  if (files.length < minPhotos || files.length > maxPhotos) {
    return {
      error:
        minPhotos === 0
          ? `Maksimalno ${maxPhotos} slika.`
          : `Dodaj između 1 i ${maxPhotos} slika.`,
    }
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: 'Slike moraju biti JPG, PNG, WebP ili GIF.' }
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { error: 'Svaka slika mora biti manja od 5 MB.' }
    }
  }

  const slug = generateSurpriseSlug()
  const photoUrls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const upload = await uploadSurprisePhoto(files[i], slug, i)
    if ('error' in upload) {
      return { error: `Upload slike nije uspeo: ${upload.error}` }
    }
    photoUrls.push(upload.url)
  }

  if (templateId === 'secret_quiz') {
    let parsed
    try {
      parsed = quizCreateFormSchema.parse(JSON.parse(raw))
    } catch {
      return { error: 'Proveri sva polja pre objave.' }
    }

    const payload = quizFormValuesToPayload(parsed, photoUrls)
    const validated = secretQuizPayloadSchema.safeParse(payload)
    if (!validated.success) {
      return { error: 'Proveri sva polja pre objave.' }
    }

    return publishWithRetry(slug, templateId, tier, validated.data)
  }

  if (templateId === 'unlock_phone') {
    let parsed
    try {
      parsed = phoneCreateFormSchema.parse(JSON.parse(raw))
    } catch {
      return { error: 'Proveri sva polja pre objave.' }
    }

    const payload = phoneFormValuesToPayload(parsed, photoUrls)
    const validated = unlockPhonePayloadSchema.safeParse(payload)
    if (!validated.success) {
      return { error: 'Proveri sva polja pre objave.' }
    }

    return publishWithRetry(slug, templateId, tier, validated.data, {
      smsSchedule:
        validated.data.smsEnabled && validated.data.recipientPhone
          ? {
              phone: validated.data.recipientPhone,
              notifications: validated.data.notifications,
              senderName: validated.data.senderName,
              startAt: validated.data.smsStartAt
                ? new Date(validated.data.smsStartAt)
                : new Date(),
            }
          : undefined,
    })
  }

  if (templateId === 'countdown') {
    let parsed
    try {
      parsed = countdownCreateFormSchema.parse(JSON.parse(raw))
    } catch {
      return { error: 'Proveri sva polja pre objave.' }
    }

    const payload = countdownFormToPayload(
      parsed,
      photoUrls,
      tier === 'basic' ? 'standard' : tier
    )
    const validated = countdownPayloadSchema.safeParse(payload)
    if (!validated.success) {
      return { error: 'Proveri sva polja pre objave.' }
    }

    return publishWithRetry(slug, templateId, tier, validated.data)
  }

  let parsed
  try {
    parsed = createFormSchema.parse(JSON.parse(raw))
  } catch {
    return { error: 'Proveri sva polja pre objave.' }
  }

  const payload = formValuesToPayload(parsed, photoUrls, tier)
  const validated = loveMessagePayloadSchema.safeParse(payload)
  if (!validated.success) {
    return { error: 'Proveri sva polja pre objave.' }
  }

  return publishWithRetry(slug, templateId, tier, validated.data)
}

async function publishWithRetry(
  slug: string,
  templateId: string,
  tier: Tier,
  payload: Parameters<typeof insertSurprise>[3],
  extras?: {
    smsSchedule?: {
      phone: string
      notifications: { title: string; body: string }[]
      senderName: string
      startAt: Date
    }
  }
): Promise<CreateSurpriseResult> {
  const needsPayment = tierRequiresPayment(tier)
  let currentSlug = slug
  let attempt = 0

  const recipientPhone = extras?.smsSchedule?.phone
    ? normalizePhoneE164(extras.smsSchedule.phone)
    : null

  while (attempt < 3) {
    const result = await insertSurprise(currentSlug, templateId, tier, payload, {
      status: needsPayment ? 'draft' : 'published',
      paymentStatus: needsPayment ? 'pending' : 'free',
      recipientPhone: recipientPhone ?? undefined,
    })

    if ('error' in result) {
      if (!result.error.includes('Slug')) {
        return { error: result.error }
      }
      currentSlug = generateSurpriseSlug()
      attempt++
      continue
    }

    if (extras?.smsSchedule && recipientPhone) {
      const scheduled = await scheduleNotificationJobs(
        result.id,
        recipientPhone,
        extras.smsSchedule.notifications,
        currentSlug,
        extras.smsSchedule.senderName,
        extras.smsSchedule.startAt
      )
      if ('error' in scheduled) {
        return { error: scheduled.error }
      }
    }

    if (needsPayment) {
      const checkout = await createCheckoutSession({
        slug: currentSlug,
        tier,
        templateId,
      })

      if ('error' in checkout) {
        return { error: checkout.error }
      }

      const sessionUpdate = await updateSurpriseCheckout(currentSlug, checkout.sessionId)
      if ('error' in sessionUpdate) {
        return { error: sessionUpdate.error }
      }

      return { checkoutUrl: checkout.url, slug: currentSlug }
    }

    return { slug: currentSlug }
  }

  return { error: 'Nije moguće kreirati link. Pokušaj ponovo.' }
}
