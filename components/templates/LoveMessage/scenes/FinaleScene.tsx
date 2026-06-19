'use client'

import { motion } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { SceneProps } from '../types'

const CONFETTI_ITEMS = [
  { emoji: '🎊', col: 10 },
  { emoji: '✨', col: 22 },
  { emoji: '🎉', col: 35 },
  { emoji: '💖', col: 48 },
  { emoji: '🌸', col: 60 },
  { emoji: '🎊', col: 72 },
  { emoji: '💫', col: 82 },
  { emoji: '✨', col: 93 },
  { emoji: '💗', col: 15 },
  { emoji: '🎈', col: 55 },
  { emoji: '💕', col: 40 },
  { emoji: '🌹', col: 70 },
]

function ConfettiItem({ emoji, col, index }: { emoji: string; col: number; index: number }) {
  const duration = 2.5 + (index % 4) * 0.5
  const delay = (index * 0.18) % 1.5

  return (
    <motion.span
      className="absolute text-2xl pointer-events-none select-none"
      style={{ left: `${col}%`, top: '-5%' }}
      initial={{ y: 0, opacity: 0, rotate: 0 }}
      animate={{
        y: '110vh',
        opacity: [0, 1, 1, 0],
        rotate: index % 2 === 0 ? [0, 180, 360] : [0, -180, -360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: 0.3,
      }}
    >
      {emoji}
    </motion.span>
  )
}

export default function FinaleScene({
  data,
  templateLabel,
}: SceneProps & { templateLabel?: string }) {
  const theme = useExperienceTheme()

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: sceneBackground(theme) }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI_ITEMS.map((item, i) => (
          <ConfettiItem key={i} emoji={item.emoji} col={item.col} index={i} />
        ))}
      </div>

      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 380,
          height: 380,
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        }}
        animate={{ scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <motion.div
          className="text-7xl"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.2 }}
        >
          <motion.span
            className="inline-block"
            style={{ color: theme.accent }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            ♥
          </motion.span>
        </motion.div>

        <motion.h1
          className="font-serif text-4xl leading-tight font-bold text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ textShadow: `0 0 50px ${theme.glow}` }}
        >
          {data.finaleText}
        </motion.h1>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="h-px w-12" style={{ backgroundColor: `${theme.accent}66` }} />
          <p className="text-sm" style={{ color: theme.accentMuted }}>
            sa ljubavlju od {data.senderName}
          </p>
          <div className="h-px w-12" style={{ backgroundColor: `${theme.accent}66` }} />
        </motion.div>

        <motion.div
          className="mt-4 rounded-2xl border border-white/15 bg-white/8 px-6 py-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.7 }}
        >
          <p className="text-center text-sm leading-relaxed text-white/70">
            {templateLabel
              ? `${templateLabel} — napravio/la ${data.senderName}`
              : 'Ovo iznenađenje napravila je ljubav ♥'}
          </p>
          <p
            className="mt-1 text-center text-xs tracking-wider"
            style={{ color: theme.accentMuted }}
          >
            iznenadi.me
          </p>
        </motion.div>
      </div>
    </div>
  )
}
