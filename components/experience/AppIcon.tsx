'use client'

export type AppIconVariant = 'message' | 'unknown' | 'unlock'

const ICONS: Record<AppIconVariant, React.ReactNode> = {
  message: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  ),
  unknown: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  unlock: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  ),
}

interface AppIconProps {
  variant?: AppIconVariant
  className?: string
}

export default function AppIcon({ variant = 'message', className = '' }: AppIconProps) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-inner ${className}`}
    >
      {ICONS[variant]}
    </span>
  )
}

export function iconVariantForIndex(
  index: number,
  total: number
): AppIconVariant {
  if (index === total - 1) return 'unlock'
  if (index === 0) return 'unknown'
  return 'message'
}
