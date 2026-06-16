'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import PhotoLightbox from '@/components/experience/PhotoLightbox'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { SceneProps } from '../types'

const PHOTO_EMOJIS = ['📸', '🌸', '✨', '💫', '🌹']
const PHOTO_LABELS = ['Naš trenutak', 'Poseban dan', 'Uspomene', 'Zajedno', 'Uspon']
const PHOTO_GRADIENTS = [
  'from-rose-900 to-pink-700',
  'from-fuchsia-900 to-rose-700',
  'from-purple-900 to-fuchsia-700',
  'from-violet-900 to-purple-700',
  'from-pink-900 to-rose-700',
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.6 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.05] as const },
  },
}

export default function PhotosScene({ data, onAdvance, enableLightbox }: SceneProps) {
  const theme = useExperienceTheme()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const colCount = data.photos.length <= 3 ? 3 : data.photos.length === 4 ? 2 : 3

  function handlePhotoClick(e: React.MouseEvent, index: number) {
    e.stopPropagation()
    if (enableLightbox) {
      setLightboxIndex(index)
    }
  }

  function handleAdvance() {
    if (lightboxIndex !== null) return
    onAdvance()
  }

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden px-5"
      style={{ background: sceneBackground(theme) }}
      onClick={handleAdvance}
    >
      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="mb-2 text-xs tracking-[0.3em] uppercase"
            style={{ color: theme.accentMuted }}
          >
            naši trenuci
          </p>
          <h2 className="font-serif text-3xl font-bold text-white">📷 Slike</h2>
        </motion.div>

        <motion.div
          className={`grid gap-3 ${colCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.photos.map((src, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className={`relative overflow-hidden rounded-2xl shadow-2xl ${
                enableLightbox ? 'cursor-zoom-in' : ''
              } ${data.photos.length === 5 && i === 4 ? 'col-span-3 mx-auto aspect-[16/9] w-2/3' : 'aspect-[3/4]'}`}
              onClick={(e) => handlePhotoClick(e, i)}
            >
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b ${PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length]}`}
              >
                <span className="text-3xl">{PHOTO_EMOJIS[i % PHOTO_EMOJIS.length]}</span>
                <span className="px-1 text-center text-xs leading-tight text-white/60">
                  {PHOTO_LABELS[i % PHOTO_LABELS.length]}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Slika ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />
              {enableLightbox && (
                <div className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/70">
                  🔍
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="mt-4 text-center text-xs text-white/40 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {enableLightbox
            ? 'Tapni sliku za uvećanje · tapni ispod za nastavak'
            : 'Svaka fotografija priča priču...'}
        </motion.p>
      </div>

      <motion.p
        className="absolute bottom-16 text-xs tracking-widest uppercase"
        style={{ color: theme.accentMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        tapni za nastavak
      </motion.p>

      {enableLightbox && lightboxIndex !== null && (
        <PhotoLightbox
          src={data.photos[lightboxIndex]}
          alt={`Slika ${lightboxIndex + 1}`}
          open
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
