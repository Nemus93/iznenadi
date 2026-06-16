import { z } from 'zod'
import { customColorsSchema, THEMES, type ExperienceSceneData } from './experience'
import { phoneNotificationSchema } from './unlock-phone-types'

export type { PhoneNotification } from './unlock-phone-types'
export { phoneNotificationSchema } from './unlock-phone-types'

export const unlockPhonePayloadSchema = z.object({
  recipientName: z.string().min(1).max(50),
  senderName: z.string().min(1).max(50),
  occasion: z.string().min(1).max(100),
  notifications: z.array(phoneNotificationSchema).min(3).max(5),
  photos: z.array(z.string().url()).min(1).max(5),
  mainMessage: z.string().min(10).max(2000),
  finaleText: z.string().min(1).max(200),
  themeMode: z.enum(['preset', 'custom']).default('preset'),
  theme: z.enum(THEMES),
  customColors: customColorsSchema.optional(),
  tier: z.literal('premium').default('premium'),
})

export type UnlockPhonePayload = z.infer<typeof unlockPhonePayloadSchema>

export const phoneCreateFormSchema = z
  .object({
    recipientName: z.string().min(1, 'Unesi ime primaoca').max(50),
    senderName: z.string().min(1, 'Unesi svoje ime').max(50),
    occasion: z.string().min(1, 'Unesi povod').max(100),
    notifications: z.array(phoneNotificationSchema).min(3).max(5),
    mainMessage: z.string().min(10, 'Poruka mora imati bar 10 karaktera').max(2000),
    finaleText: z.string().min(1, 'Unesi završni tekst').max(200),
    themeMode: z.enum(['preset', 'custom']),
    theme: z.enum(THEMES),
    customColors: customColorsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.themeMode === 'custom' && !data.customColors) {
      ctx.addIssue({
        code: 'custom',
        message: 'Izaberi custom boje',
        path: ['customColors'],
      })
    }
  })

export type PhoneCreateFormValues = z.infer<typeof phoneCreateFormSchema>

export const defaultPhoneCreateFormValues: PhoneCreateFormValues = {
  recipientName: '',
  senderName: '',
  occasion: '',
  notifications: [
    { title: '', body: '' },
    { title: '', body: '' },
    { title: '', body: '' },
  ],
  mainMessage: '',
  finaleText: '',
  themeMode: 'preset',
  theme: 'rose',
}

export function phoneFormValuesToPayload(
  values: PhoneCreateFormValues,
  photoUrls: string[]
): UnlockPhonePayload {
  return {
    recipientName: values.recipientName.trim(),
    senderName: values.senderName.trim(),
    occasion: values.occasion.trim(),
    notifications: values.notifications.map((n) => ({
      title: n.title.trim(),
      body: n.body.trim(),
      photoIndex:
        n.photoIndex !== undefined && n.photoIndex < photoUrls.length
          ? n.photoIndex
          : undefined,
    })),
    photos: photoUrls,
    mainMessage: values.mainMessage.trim(),
    finaleText: values.finaleText.trim(),
    themeMode: values.themeMode,
    theme: values.theme,
    customColors: values.themeMode === 'custom' ? values.customColors : undefined,
    tier: 'premium',
  }
}

export function unlockPhoneToSceneData(payload: UnlockPhonePayload): ExperienceSceneData {
  return {
    recipientName: payload.recipientName,
    senderName: payload.senderName,
    occasion: payload.occasion,
    photos: payload.photos,
    mainMessage: payload.mainMessage,
    finaleText: payload.finaleText,
    themeMode: payload.themeMode,
    theme: payload.theme,
    customColors: payload.customColors,
    tier: payload.tier,
  }
}
