import { z } from 'zod'

export const THEMES = ['rose', 'violet', 'sunset', 'midnight', 'gold', 'ocean'] as const
export type Theme = (typeof THEMES)[number]

export const TIERS = ['basic', 'standard', 'premium'] as const
export type Tier = (typeof TIERS)[number]

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Unesi validnu hex boju')

export const customColorsSchema = z.object({
  primary: hexColor,
  accent: hexColor,
  background: hexColor,
})

export type CustomColors = z.infer<typeof customColorsSchema>

export interface ExperienceSceneData {
  recipientName: string
  senderName: string
  occasion: string
  photos: string[]
  mainMessage: string
  finaleText: string
  themeMode: 'preset' | 'custom'
  theme: Theme
  customColors?: CustomColors
  tier: Tier
}
