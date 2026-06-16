'use client'

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react'
import { resolveThemeColors, type ResolvedTheme } from '@/lib/themes/resolve-theme'
import type { ExperienceSceneData } from '@/lib/types/experience'

const ThemeContext = createContext<ResolvedTheme | null>(null)

interface ThemeProviderProps {
  data: ExperienceSceneData
  children: ReactNode
}

export function ThemeProvider({ data, children }: ThemeProviderProps) {
  const theme = useMemo(() => resolveThemeColors(data), [data])

  const style = {
    '--iz-bg-start': theme.bgStart,
    '--iz-bg-mid': theme.bgMid,
    '--iz-bg-end': theme.bgEnd,
    '--iz-glow': theme.glow,
    '--iz-accent': theme.accent,
    '--iz-accent-muted': theme.accentMuted,
  } as CSSProperties

  return (
    <ThemeContext.Provider value={theme}>
      <div style={style} className="h-full w-full">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useExperienceTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useExperienceTheme must be used within ThemeProvider')
  }
  return ctx
}
