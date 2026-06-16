import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { publishSurprisePayment, markSurprisePaymentFailed } from '@/lib/surprises'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe nije konfigurisan.' }, { status: 503 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET nedostaje.' }, { status: 503 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe klijent nije dostupan.' }, { status: 503 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Nedostaje stripe-signature.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Nevalidan webhook potpis.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const slug = session.metadata?.slug
    if (slug && session.payment_status === 'paid') {
      await publishSurprisePayment(slug, session.amount_total)
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const slug = session.metadata?.slug
    if (slug) await markSurprisePaymentFailed(slug)
  }

  return NextResponse.json({ received: true })
}
