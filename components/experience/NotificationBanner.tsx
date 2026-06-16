'use client'

import { motion } from 'framer-motion'

interface NotificationBannerProps {
  title: string
  body: string
  time?: string
  appIcon?: string
  onClick?: () => void
  index?: number
}

export default function NotificationBanner({
  title,
  body,
  time = 'sada',
  appIcon = '💌',
  onClick,
  index = 0,
}: NotificationBannerProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/12 p-3 text-left backdrop-blur-md transition hover:bg-white/18 active:scale-[0.98]"
      initial={{ opacity: 0, y: -24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg">
          {appIcon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold text-white/90">{title}</p>
            <span className="shrink-0 text-[10px] text-white/50">{time}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-white/75">{body}</p>
        </div>
      </div>
    </motion.button>
  )
}
