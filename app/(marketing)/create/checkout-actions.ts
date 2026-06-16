'use server'

import { fulfillCheckoutSession } from '@/lib/checkout'

export async function fulfillCheckoutAction(sessionId: string): Promise<boolean> {
  if (!sessionId) return false
  return fulfillCheckoutSession(sessionId)
}
