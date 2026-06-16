import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { CreateSurpriseResult } from '@/app/(marketing)/create/actions'

export function handleCreateSurpriseResult(
  result: CreateSurpriseResult,
  router: AppRouterInstance,
  onError: (message: string) => void
): void {
  if ('error' in result) {
    onError(result.error)
    return
  }

  if ('checkoutUrl' in result) {
    window.location.href = result.checkoutUrl
    return
  }

  router.push(`/create/done?slug=${result.slug}`)
}
