'use client'

import { motion } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { CountdownPayload } from '@/lib/types/countdown'

interface IntroSceneProps {
  data: CountdownPayload
  onAdvance: () => void
}

export default function IntroScene({ data, onAdvance }: IntroSceneProps) {
  const theme = useExperienceTheme()

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center px-8 text-center"
      style={{ background: sceneBackground(theme) }}
      onClick={onAdvance}
    >
      <motion.p
        className="text-sm tracking-[0.25em] uppercase"
        style={{ color: theme.accentMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {data.occasion}
      </motion.p>
      <motion.h1
        className="mt-4 font-serif text-4xl font-bold text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Odbrojavanje za {data.recipientName}
      </motion.h1>
      <motion.p
        className="mt-4 text-white/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Od {data.senderName}
      </motion.p>
      <motion.p
        className="absolute bottom-16 text-xs tracking-widest uppercase"
        style={{ color: theme.accentMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        tapni za početak
      </motion.p>
    </div>
  )
}
