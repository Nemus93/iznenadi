import Stripe from 'stripe'
import type { Tier } from '@/lib/types/surprise'
import { stripePriceIdForTier, TIER_PRICE_RSD } from '@/lib/billing'

let stripeClient: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  }
  return stripeClient
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

export async function createCheckoutSession(params: {
  slug: string
  tier: Tier
  templateId: string
}): Promise<{ url: string; sessionId: string } | { error: string }> {
  const stripe = getStripe()
  if (!stripe) {
    return { error: 'Stripe nije konfigurisan (STRIPE_SECRET_KEY).' }
  }

  const priceId = stripePriceIdForTier(params.tier)
  const base = getAppBaseUrl()

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: 'rsd',
            product_data: {
              name: `Iznenadi — ${params.tier}`,
              description: `Digitalno iznenađenje (${params.templateId})`,
            },
            unit_amount: TIER_PRICE_RSD[params.tier] * 100,
          },
          quantity: 1,
        },
      ]

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${base}/create/done?slug=${params.slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/create?template=${params.templateId}&tier=${params.tier}&payment=cancelled`,
      metadata: {
        slug: params.slug,
        tier: params.tier,
        template: params.templateId,
      },
    })

    if (!session.url) {
      return { error: 'Stripe nije vratio checkout URL.' }
    }

    return { url: session.url, sessionId: session.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe greška'
    return { error: message }
  }
}

export async function verifyCheckoutSession(sessionId: string): Promise<{
  slug: string
  paid: boolean
  amountTotal: number | null
} | null> {
  const stripe = getStripe()
  if (!stripe) return null

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const slug = session.metadata?.slug
    if (!slug) return null

    return {
      slug,
      paid: session.payment_status === 'paid',
      amountTotal: session.amount_total,
    }
  } catch {
    return null
  }
}
