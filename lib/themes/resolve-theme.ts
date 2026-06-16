import type { ExperienceSceneData } from '@/lib/types/experience'
import { THEME_PRESETS, type ThemeColors } from './presets'

export type ResolvedTheme = ThemeColors

function darken(hex: string, amount: number): string {
  const n = hex.replace('#', '')
  const r = Math.max(0, parseInt(n.slice(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(n.slice(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(n.slice(4, 6), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function hexToRgba(hex: string, alpha: number): string {
  const n = hex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function resolveCustomColors(colors: NonNullable<ExperienceSceneData['customColors']>): ThemeColors {
  const bgStart = darken(colors.background, 10)
  const bgMid = colors.background
  const bgEnd = darken(colors.primary, 5)

  return {
    bgStart,
    bgMid,
    bgEnd,
    glow: hexToRgba(colors.primary, 0.18),
    accent: colors.accent,
    accentMuted: hexToRgba(colors.accent, 0.7),
  }
}

export function resolveThemeColors(data: ExperienceSceneData): ResolvedTheme {
  if (data.themeMode === 'custom' && data.customColors) {
    return resolveCustomColors(data.customColors)
  }

  return THEME_PRESETS[data.theme]
}

export function sceneBackground(theme: ResolvedTheme): string {
  return `linear-gradient(160deg, ${theme.bgStart} 0%, ${theme.bgMid} 45%, ${theme.bgEnd} 100%)`
}
