'use client'

import { motion } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { SecretQuizPayload } from '@/lib/types/secret-quiz'

interface IntroSceneProps {
  data: SecretQuizPayload
  onAdvance: () => void
}

export default function IntroScene({ data, onAdvance }: IntroSceneProps) {
  const theme = useExperienceTheme()

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden px-8"
      style={{ background: sceneBackground(theme) }}
      onClick={onAdvance}
    >
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 360,
          height: 360,
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <motion.p
          className="text-5xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, delay: 0.2 }}
        >
          🎯
        </motion.p>

        <motion.p
          className="text-sm tracking-[0.3em] uppercase"
          style={{ color: theme.accentMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          tajni kviz
        </motion.p>

        <motion.h1
          className="font-serif text-4xl leading-tight font-bold text-white sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ textShadow: `0 0 40px ${theme.glow}` }}
        >
          {data.recipientName}, da li me
          <br />
          stvarno poznaješ?
        </motion.h1>

        <motion.p
          className="max-w-xs text-base leading-relaxed"
          style={{ color: theme.accentMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {data.senderName} ti je pripremio/la {data.quizQuestions.length} pitanja. Tačan odgovor
          otključava sledeći korak — pa onda i poruku.
        </motion.p>

        <motion.p
          className="text-sm italic"
          style={{ color: theme.accentMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {data.occasion}
        </motion.p>
      </div>

      <motion.p
        className="absolute bottom-16 text-xs tracking-widest uppercase"
        style={{ color: theme.accentMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        tapni za početak kviza
      </motion.p>
    </div>
  )
}
