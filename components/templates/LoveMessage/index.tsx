'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from '@/components/experience/ThemeProvider'
import { tierSupportsLightbox } from '@/lib/templates/registry'
import type { SurpriseData } from './types'
import IntroScene from './scenes/IntroScene'
import ReasonsScene from './scenes/ReasonsScene'
import PhotosScene from './scenes/PhotosScene'
import MessageScene from './scenes/MessageScene'
import FinaleScene from './scenes/FinaleScene'

const SCENES = [IntroScene, ReasonsScene, PhotosScene, MessageScene, FinaleScene]

const SLIDE_VARIANTS = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
}

interface LoveMessageProps {
  data: SurpriseData
}

export default function LoveMessage({ data }: LoveMessageProps) {
  const [sceneIndex, setSceneIndex] = useState(0)
  const enableLightbox = tierSupportsLightbox(data.tier)

  const advance = () => {
    if (sceneIndex < SCENES.length - 1) {
      setSceneIndex((prev) => prev + 1)
    }
  }

  const CurrentScene = SCENES[sceneIndex]
  const isLastScene = sceneIndex === SCENES.length - 1

  return (
    <ThemeProvider data={data}>
      <div className="relative h-dvh w-full touch-manipulation overflow-hidden select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <CurrentScene
              data={data}
              onAdvance={advance}
              isLastScene={isLastScene}
              enableLightbox={enableLightbox}
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute right-0 bottom-6 left-0 z-50 flex items-center justify-center gap-2">
          {SCENES.map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full bg-white/30"
              animate={{
                width: i === sceneIndex ? 24 : 6,
                backgroundColor:
                  i < sceneIndex
                    ? 'rgba(255,255,255,0.55)'
                    : i === sceneIndex
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(255,255,255,0.25)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </ThemeProvider>
  )
}
