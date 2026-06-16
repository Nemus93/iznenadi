'use client'

import { motion } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { SceneProps } from '../types'

const HEARTS = ['♥', '♡', '❤', '💕', '💗', '💖', '✨', '💫']

function FloatingParticle({ index }: { index: number }) {
  const left = `${(index * 13 + 7) % 100}%`
  const duration = 4 + (index % 3) * 1.5
  const delay = (index * 0.4) % 3
  const size = index % 3 === 0 ? 'text-2xl' : index % 3 === 1 ? 'text-xl' : 'text-base'
  const symbol = HEARTS[index % HEARTS.length]

  return (
    <motion.span
      className={`absolute ${size} pointer-events-none select-none`}
      style={{ left, bottom: '-10%' }}
      animate={{
        y: [0, '-120vh'],
        opacity: [0, 0.7, 0.7, 0],
        rotate: [0, index % 2 === 0 ? 20 : -20],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    >
      {symbol}
    </motion.span>
  )
}

export default function IntroScene({ data, onAdvance }: SceneProps) {
  const theme = useExperienceTheme()

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden"
      style={{ background: sceneBackground(theme) }}
      onClick={onAdvance}
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}
      </div>

      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 340,
          height: 340,
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <motion.p
          className="text-lg font-light tracking-[0.3em] uppercase"
          style={{ color: theme.accentMuted }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          za tebe
        </motion.p>

        <motion.h1
          className="font-serif text-6xl leading-tight font-bold text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.175, 0.885, 0.32, 1.1] }}
          style={{ textShadow: `0 0 40px ${theme.glow}` }}
        >
          {data.recipientName}
        </motion.h1>

        <motion.div
          className="text-5xl"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.3, type: 'spring', stiffness: 300 }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
            className="inline-block"
            style={{ color: theme.accent }}
          >
            ♥
          </motion.span>
        </motion.div>

        <motion.p
          className="max-w-xs text-base font-light"
          style={{ color: theme.accentMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          {data.occasion}
        </motion.p>
      </div>

      <motion.div
        className="absolute bottom-16 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
      >
        <motion.p
          className="text-sm tracking-widest uppercase"
          style={{ color: theme.accentMuted }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          tapni za nastavak
        </motion.p>
        <motion.div
          style={{ color: theme.accent }}
          className="text-xs opacity-50"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          ↓
        </motion.div>
      </motion.div>
    </div>
  )
}
