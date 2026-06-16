import type { Tier } from '@/lib/types/surprise'

export type TemplateId = 'love_message' | 'secret_quiz' | 'unlock_phone'

export interface TemplateTierOption {
  tier: Tier
  label: string
  priceLabel: string
  features: string[]
}

export interface TemplateDefinition {
  id: TemplateId
  name: string
  description: string
  emoji: string
  demoPath: string
  available: boolean
  tiers: TemplateTierOption[]
}

export const TIER_LABELS: Record<Tier, string> = {
  basic: 'Poruka srca',
  standard: 'Tvoja boja',
  premium: 'Mini avantura',
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'love_message',
    name: 'Poruka srca',
    description:
      'Animirana romantična poruka sa razlozima, slikama i tvojim rečima — tap za tap.',
    emoji: '💌',
    demoPath: '/demo',
    available: true,
    tiers: [
      {
        tier: 'basic',
        label: TIER_LABELS.basic,
        priceLabel: 'Besplatno (beta)',
        features: ['5 animiranih scena', '3 preset boje', 'Do 3 slike'],
      },
      {
        tier: 'standard',
        label: TIER_LABELS.standard,
        priceLabel: 'Besplatno (beta)',
        features: [
          'Sve iz Basic',
          '6 preset boja ili tvoja kombinacija',
          'Lightbox uvećanje slika',
          'Do 5 slika',
        ],
      },
    ],
  },
  {
    id: 'secret_quiz',
    name: 'Tajni kviz',
    description:
      'Primalac odgovara na pitanja o vezi da bi otključao poruku — mini igra ljubavi.',
    emoji: '🎯',
    demoPath: '/demo/quiz',
    available: true,
    tiers: [
      {
        tier: 'premium',
        label: TIER_LABELS.premium,
        priceLabel: 'Besplatno (beta)',
        features: ['3–5 pitanja o vezi', 'Interaktivno otključavanje', 'Finale sa porukom'],
      },
    ],
  },
  {
    id: 'unlock_phone',
    name: 'Otključaj telefon',
    description:
      'Zaključan telefon sa notifikacijama — svaka otkriva deo priče do glavne poruke.',
    emoji: '📱',
    demoPath: '/demo/phone',
    available: true,
    tiers: [
      {
        tier: 'premium',
        label: TIER_LABELS.premium,
        priceLabel: 'Besplatno (beta)',
        features: ['Lock screen animacija', 'Notifikacije jedna po jedna', 'Dramatičan finale'],
      },
    ],
  },
]

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getMaxPhotos(tier: Tier): number {
  return tier === 'basic' ? 3 : 5
}

export function tierSupportsCustomColors(tier: Tier): boolean {
  return tier === 'standard' || tier === 'premium'
}

export function tierSupportsLightbox(tier: Tier): boolean {
  return tier === 'standard' || tier === 'premium'
}
