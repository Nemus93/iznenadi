'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoLightboxProps {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}

export default function PhotoLightbox({ src, alt, open, onClose }: PhotoLightboxProps) {
  const [zoom, setZoom] = useState(1)

  const handleClose = useCallback(() => {
    setZoom(1)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, handleClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
            aria-label="Zatvori"
          >
            ✕
          </button>

          <motion.div
            className="relative max-h-[90dvh] max-w-[95vw] overflow-auto"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[90dvh] max-w-[95vw] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              onClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
            />
          </motion.div>

          <p className="absolute bottom-6 text-xs tracking-widest text-white/40 uppercase">
            Tapni sliku za uvećanje · tapni van za zatvaranje
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
