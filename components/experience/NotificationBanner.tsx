'use client'

import { motion } from 'framer-motion'
import AppIcon, { iconVariantForIndex, type AppIconVariant } from '@/components/experience/AppIcon'

interface NotificationBannerProps {
  title: string
  body: string
  time?: string
  iconVariant?: AppIconVariant
  onClick?: () => void
  index?: number
  dimmed?: boolean
}

export default function NotificationBanner({
  title,
  body,
  time = 'sada',
  iconVariant = 'message',
  onClick,
  index = 0,
  dimmed = false,
}: NotificationBannerProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={dimmed}
      className={`w-full rounded-2xl border border-white/15 p-3 text-left shadow-lg backdrop-blur-xl transition ${
        dimmed
          ? 'cursor-default bg-white/5 opacity-60'
          : 'bg-white/18 hover:bg-white/22 active:scale-[0.98]'
      }`}
      initial={{ opacity: 0, y: -28, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 340, damping: 22 }}
    >
      <div className="flex items-start gap-3">
        <AppIcon variant={iconVariant} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold text-white">{title}</p>
            <span className="shrink-0 text-[10px] text-white/55">{time}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-white/80">{body}</p>
        </div>
      </div>
    </motion.button>
  )
}
