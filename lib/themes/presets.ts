import type { Theme } from '@/lib/types/surprise'

export interface ThemeColors {
  bgStart: string
  bgMid: string
  bgEnd: string
  glow: string
  accent: string
  accentMuted: string
}

export const THEME_PRESETS: Record<Theme, ThemeColors> = {
  rose: {
    bgStart: '#1a0510',
    bgMid: '#3d0a1f',
    bgEnd: '#6b1535',
    glow: 'rgba(219,39,119,0.18)',
    accent: '#f472b6',
    accentMuted: 'rgba(244,114,182,0.7)',
  },
  violet: {
    bgStart: '#12052a',
    bgMid: '#2d0a4e',
    bgEnd: '#5b1a7a',
    glow: 'rgba(167,105,230,0.15)',
    accent: '#c084fc',
    accentMuted: 'rgba(192,132,252,0.7)',
  },
  sunset: {
    bgStart: '#1a0a05',
    bgMid: '#4a1a0a',
    bgEnd: '#8c3a1a',
    glow: 'rgba(251,146,60,0.18)',
    accent: '#fb923c',
    accentMuted: 'rgba(251,146,60,0.7)',
  },
  midnight: {
    bgStart: '#050810',
    bgMid: '#0f1a2e',
    bgEnd: '#1e3a5f',
    glow: 'rgba(96,165,250,0.15)',
    accent: '#60a5fa',
    accentMuted: 'rgba(96,165,250,0.7)',
  },
  gold: {
    bgStart: '#1a1405',
    bgMid: '#3d2e0a',
    bgEnd: '#6b5015',
    glow: 'rgba(250,204,21,0.15)',
    accent: '#facc15',
    accentMuted: 'rgba(250,204,21,0.7)',
  },
  ocean: {
    bgStart: '#051018',
    bgMid: '#0a2838',
    bgEnd: '#0e4d6e',
    glow: 'rgba(45,212,191,0.15)',
    accent: '#2dd4bf',
    accentMuted: 'rgba(45,212,191,0.7)',
  },
}

export const THEME_LABELS: Record<Theme, string> = {
  rose: 'Ružičasta',
  violet: 'Ljubičasta',
  sunset: 'Zlatna',
  midnight: 'Ponoć plava',
  gold: 'Zlatni sjaj',
  ocean: 'Okean',
}

export const BASIC_THEMES: Theme[] = ['rose', 'violet', 'sunset']
export const STANDARD_THEMES: Theme[] = ['rose', 'violet', 'sunset', 'midnight', 'gold', 'ocean']
