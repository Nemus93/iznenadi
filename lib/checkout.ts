import { verifyCheckoutSession } from '@/lib/stripe'
import { publishSurprisePayment } from '@/lib/surprises'

export async function fulfillCheckoutSession(sessionId: string): Promise<boolean> {
  const verified = await verifyCheckoutSession(sessionId)
  if (!verified?.paid) return false

  const result = await publishSurprisePayment(verified.slug, verified.amountTotal)
  return !('error' in result)
}
