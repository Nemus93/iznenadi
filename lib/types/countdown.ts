import { z } from 'zod'
import { customColorsSchema, THEMES, type ExperienceSceneData } from './experience'

export const countdownPayloadSchema = z.object({
  recipientName: z.string().min(1).max(50),
  senderName: z.string().min(1).max(50),
  occasion: z.string().min(1).max(100),
  targetAt: z.string().min(1),
  teaserMessage: z.string().min(1).max(200),
  photos: z.array(z.string().url()).min(0).max(5),
  mainMessage: z.string().min(10).max(2000),
  finaleText: z.string().min(1).max(200),
  themeMode: z.enum(['preset', 'custom']).default('preset'),
  theme: z.enum(THEMES),
  customColors: customColorsSchema.optional(),
  tier: z.enum(['standard', 'premium']).default('standard'),
})

export type CountdownPayload = z.infer<typeof countdownPayloadSchema>

export const countdownCreateFormSchema = z
  .object({
    recipientName: z.string().min(1).max(50),
    senderName: z.string().min(1).max(50),
    occasion: z.string().min(1).max(100),
    targetAt: z.string().min(1, 'Izaberi datum i vreme'),
    teaserMessage: z.string().min(1).max(200),
    mainMessage: z.string().min(10).max(2000),
    finaleText: z.string().min(1).max(200),
    themeMode: z.enum(['preset', 'custom']),
    theme: z.enum(THEMES),
    customColors: customColorsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.themeMode === 'custom' && !data.customColors) {
      ctx.addIssue({ code: 'custom', message: 'Izaberi custom boje', path: ['customColors'] })
    }
    const target = new Date(data.targetAt)
    if (Number.isNaN(target.getTime()) || target.getTime() <= Date.now()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Datum mora biti u budućnosti',
        path: ['targetAt'],
      })
    }
  })

export type CountdownCreateFormValues = z.infer<typeof countdownCreateFormSchema>

export const defaultCountdownFormValues: CountdownCreateFormValues = {
  recipientName: '',
  senderName: '',
  occasion: '',
  targetAt: '',
  teaserMessage: 'Nešto posebno te čeka...',
  mainMessage: '',
  finaleText: '',
  themeMode: 'preset',
  theme: 'rose',
}

export function countdownFormToPayload(
  values: CountdownCreateFormValues,
  photoUrls: string[],
  tier: 'standard' | 'premium'
): CountdownPayload {
  return {
    recipientName: values.recipientName.trim(),
    senderName: values.senderName.trim(),
    occasion: values.occasion.trim(),
    targetAt: new Date(values.targetAt).toISOString(),
    teaserMessage: values.teaserMessage.trim(),
    photos: photoUrls,
    mainMessage: values.mainMessage.trim(),
    finaleText: values.finaleText.trim(),
    themeMode: values.themeMode,
    theme: values.theme,
    customColors: values.themeMode === 'custom' ? values.customColors : undefined,
    tier,
  }
}

export function countdownToSceneData(payload: CountdownPayload): ExperienceSceneData {
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
