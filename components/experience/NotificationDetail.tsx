'use client'

import { motion } from 'framer-motion'
import AppIcon from '@/components/experience/AppIcon'

interface NotificationDetailProps {
  title: string
  body: string
  imageUrl?: string
  iconVariant?: 'message' | 'unknown' | 'unlock'
  onDismiss: () => void
  embedded?: boolean
}

export default function NotificationDetail({
  title,
  body,
  imageUrl,
  iconVariant = 'message',
  onDismiss,
  embedded = false,
}: NotificationDetailProps) {
  const shell = embedded ? 'absolute inset-0 z-40' : 'fixed inset-0 z-50'

  return (
    <motion.div
      className={`${shell} flex flex-col justify-start bg-black/50 backdrop-blur-md`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className="mx-3 mt-3 rounded-2xl border border-white/20 bg-zinc-900/95 p-4 shadow-2xl"
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <AppIcon variant={iconVariant} className="h-10 w-10" />
          <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-xs text-white/50">sada</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/90">{body}</p>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="mt-3 w-full rounded-xl object-cover"
            style={{ maxHeight: '180px' }}
          />
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full rounded-full bg-white/15 py-2.5 text-sm font-medium text-white transition hover:bg-white/25"
        >
          Zatvori
        </button>
      </motion.div>
    </motion.div>
  )
}
