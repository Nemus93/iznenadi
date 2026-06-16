import type { Tier } from '@/lib/types/surprise'

/** Beta default: all tiers free. Set STRIPE_PAYMENTS_ENABLED=true to charge Standard/Premium. */
export function isPaymentsEnabled(): boolean {
  return process.env.STRIPE_PAYMENTS_ENABLED === 'true'
}

export const TIER_PRICE_RSD: Record<Tier, number> = {
  basic: 890,
  standard: 1690,
  premium: 3490,
}

export function tierRequiresPayment(tier: Tier): boolean {
  if (!isPaymentsEnabled()) return false
  return tier !== 'basic'
}

export function stripePriceIdForTier(tier: Tier): string | null {
  if (tier === 'basic') return null
  if (tier === 'standard') return process.env.STRIPE_PRICE_STANDARD ?? null
  if (tier === 'premium') return process.env.STRIPE_PRICE_PREMIUM ?? null
  return null
}

export function priceLabelForTier(tier: Tier): string {
  if (!isPaymentsEnabled()) return 'Besplatno (beta)'
  if (tier === 'basic') return `${TIER_PRICE_RSD.basic} RSD`
  return `${TIER_PRICE_RSD[tier]} RSD`
}
