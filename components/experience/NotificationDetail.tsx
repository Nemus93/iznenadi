'use client'

import { motion } from 'framer-motion'

interface NotificationDetailProps {
  title: string
  body: string
  imageUrl?: string
  appIcon?: string
  onDismiss: () => void
}

export default function NotificationDetail({
  title,
  body,
  imageUrl,
  appIcon = '💌',
  onDismiss,
}: NotificationDetailProps) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className="mx-4 mt-14 rounded-3xl border border-white/15 bg-zinc-900/95 p-5 shadow-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xl">
            {appIcon}
          </span>
          <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-xs text-white/50">sada</p>
          </div>
        </div>

        <p className="mt-4 text-base leading-relaxed text-white/85">{body}</p>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="mt-4 w-full rounded-2xl object-cover"
            style={{ maxHeight: '220px' }}
          />
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full rounded-full bg-white/15 py-3 text-sm font-medium text-white transition hover:bg-white/25"
        >
          Zatvori
        </button>
      </motion.div>

      <p className="mt-6 text-center text-xs tracking-widest text-white/40 uppercase">
        tapni van kartice da zatvoriš
      </p>
    </motion.div>
  )
}
