'use client'

import { motion, type Variants } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { SceneProps } from '../types'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.5,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function ReasonsScene({ data, onAdvance }: SceneProps) {
  const theme = useExperienceTheme()

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: sceneBackground(theme) }}
      onClick={onAdvance}
    >
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="mb-2 text-xs tracking-[0.3em] uppercase"
            style={{ color: theme.accentMuted }}
          >
            razlozi zašto te volim
          </p>
          <h2 className="font-serif text-3xl font-bold text-white">
            Za tebe, {data.recipientName}
          </h2>
        </motion.div>

        <motion.ul
          className="flex flex-col gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.reasons?.map((reason, i) => (
            <motion.li
              key={i}
              variants={itemVariants}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              <span className="mt-0.5 shrink-0 text-lg" style={{ color: theme.accent }}>
                ♥
              </span>
              <p className="text-base leading-snug text-white/90">{reason}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <motion.p
        className="absolute bottom-16 text-xs tracking-widest uppercase"
        style={{ color: theme.accentMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        tapni za nastavak
      </motion.p>
    </div>
  )
}
