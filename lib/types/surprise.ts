import { z } from 'zod'
import {
  customColorsSchema,
  THEMES,
  TIERS,
  type ExperienceSceneData,
  type Tier,
} from './experience'

export type { Theme, Tier, CustomColors, ExperienceSceneData } from './experience'
export { THEMES, TIERS, customColorsSchema } from './experience'

export const TEMPLATE_IDS = ['love_message', 'secret_quiz', 'unlock_phone'] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

export const loveMessagePayloadSchema = z.object({
  recipientName: z.string().min(1, 'Unesi ime primaoca').max(50),
  senderName: z.string().min(1, 'Unesi svoje ime').max(50),
  occasion: z.string().min(1, 'Unesi povod').max(100),
  reasons: z
    .array(z.string().min(1).max(200))
    .min(3, 'Dodaj bar 3 razloga')
    .max(5),
  photos: z.array(z.string().url()).min(1, 'Dodaj bar jednu sliku').max(5),
  mainMessage: z.string().min(10, 'Poruka mora imati bar 10 karaktera').max(2000),
  finaleText: z.string().min(1, 'Unesi završni tekst').max(200),
  themeMode: z.enum(['preset', 'custom']).default('preset'),
  theme: z.enum(THEMES),
  customColors: customColorsSchema.optional(),
  tier: z.enum(TIERS).default('basic'),
})

export type LoveMessagePayload = z.infer<typeof loveMessagePayloadSchema>

/** @deprecated use LoveMessagePayload */
export type SurprisePayload = LoveMessagePayload

/** Alias used by LoveMessage template scenes */
export type SurpriseData = LoveMessagePayload

export interface SceneProps {
  data: ExperienceSceneData & { reasons?: string[] }
  onAdvance: () => void
  isLastScene: boolean
  enableLightbox?: boolean
}

export const createFormSchema = z
  .object({
    recipientName: z.string().min(1, 'Unesi ime primaoca').max(50),
    senderName: z.string().min(1, 'Unesi svoje ime').max(50),
    occasion: z.string().min(1, 'Unesi povod').max(100),
    reasons: z
      .array(z.object({ value: z.string().min(1, 'Razlog ne sme biti prazan').max(200) }))
      .min(3)
      .max(5),
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

export type CreateFormValues = z.infer<typeof createFormSchema>

export const defaultCreateFormValues: CreateFormValues = {
  recipientName: '',
  senderName: '',
  occasion: '',
  reasons: [{ value: '' }, { value: '' }, { value: '' }],
  mainMessage: '',
  finaleText: '',
  themeMode: 'preset',
  theme: 'rose',
}

export function formValuesToPayload(
  values: CreateFormValues,
  photoUrls: string[],
  tier: Tier
): LoveMessagePayload {
  return {
    recipientName: values.recipientName.trim(),
    senderName: values.senderName.trim(),
    occasion: values.occasion.trim(),
    reasons: values.reasons.map((r) => r.value.trim()).filter(Boolean),
    photos: photoUrls,
    mainMessage: values.mainMessage.trim(),
    finaleText: values.finaleText.trim(),
    themeMode: values.themeMode,
    theme: values.theme,
    customColors: values.themeMode === 'custom' ? values.customColors : undefined,
    tier,
  }
}

export const surprisePayloadSchema = loveMessagePayloadSchema
