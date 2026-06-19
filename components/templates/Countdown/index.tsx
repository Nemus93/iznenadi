'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from '@/components/experience/ThemeProvider'
import { tierSupportsLightbox } from '@/lib/templates/registry'
import { countdownToSceneData, type CountdownPayload } from '@/lib/types/countdown'
import PhotosScene from '@/components/templates/LoveMessage/scenes/PhotosScene'
import MessageScene from '@/components/templates/LoveMessage/scenes/MessageScene'
import FinaleScene from '@/components/templates/LoveMessage/scenes/FinaleScene'
import IntroScene from './scenes/IntroScene'
import CountdownScene from './scenes/CountdownScene'

type Phase = 'intro' | 'countdown' | 'photos' | 'message' | 'finale'

interface CountdownTemplateProps {
  data: CountdownPayload
}

export default function CountdownTemplate({ data }: CountdownTemplateProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const sceneData = countdownToSceneData(data)
  const enableLightbox = tierSupportsLightbox(data.tier)

  const loveProps = {
    data: { ...sceneData, reasons: [] },
    onAdvance: () => {},
    isLastScene: false,
    enableLightbox,
  }

  const targetFuture = new Date(data.targetAt).getTime() > Date.now()

  return (
    <ThemeProvider data={sceneData}>
      <div className="relative h-dvh w-full touch-manipulation overflow-hidden select-none">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" className="absolute inset-0" exit={{ opacity: 0, x: -30 }}>
              <IntroScene data={data} onAdvance={() => setPhase(targetFuture ? 'countdown' : 'message')} />
            </motion.div>
          )}
          {phase === 'countdown' && (
            <motion.div key="countdown" className="absolute inset-0" exit={{ opacity: 0 }}>
              <CountdownScene data={data} onComplete={() => setPhase(data.photos.length > 0 ? 'photos' : 'message')} />
            </motion.div>
          )}
          {phase === 'photos' && data.photos.length > 0 && (
            <motion.div key="photos" className="absolute inset-0" exit={{ opacity: 0, x: -30 }}>
              <PhotosScene {...loveProps} onAdvance={() => setPhase('message')} />
            </motion.div>
          )}
          {phase === 'message' && (
            <motion.div key="message" className="absolute inset-0" exit={{ opacity: 0, x: -30 }}>
              <MessageScene {...loveProps} onAdvance={() => setPhase('finale')} />
            </motion.div>
          )}
          {phase === 'finale' && (
            <motion.div key="finale" className="absolute inset-0">
              <FinaleScene {...loveProps} isLastScene templateLabel="Odbrojavanje" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  )
}
