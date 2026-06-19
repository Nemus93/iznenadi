'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { CountdownPayload } from '@/lib/types/countdown'

interface CountdownSceneProps {
  data: CountdownPayload
  onComplete: () => void
}

function useCountdown(targetIso: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(targetIso).getTime() - Date.now())
  )

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, new Date(targetIso).getTime() - Date.now())
      setRemaining(next)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetIso])

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, done: remaining <= 0 }
}

export default function CountdownScene({ data, onComplete }: CountdownSceneProps) {
  const theme = useExperienceTheme()
  const { days, hours, minutes, seconds, done } = useCountdown(data.targetAt)

  useEffect(() => {
    if (done) {
      const t = setTimeout(onComplete, 800)
      return () => clearTimeout(t)
    }
  }, [done, onComplete])

  const units = [
    { label: 'dana', value: days },
    { label: 'sati', value: hours },
    { label: 'min', value: minutes },
    { label: 'sek', value: seconds },
  ]

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
      style={{ background: sceneBackground(theme) }}
    >
      <motion.p
        className="mb-2 text-xs tracking-[0.3em] uppercase"
        style={{ color: theme.accentMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {data.occasion}
      </motion.p>
      <motion.h2
        className="font-serif text-3xl font-bold text-white"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {data.recipientName}, čeka te iznenađenje
      </motion.h2>
      <motion.p
        className="mt-3 max-w-sm text-sm text-white/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {data.teaserMessage}
      </motion.p>

      <motion.div
        className="mt-10 grid grid-cols-4 gap-3"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {units.map((u) => (
          <div
            key={u.label}
            className="rounded-2xl border border-white/15 bg-white/10 px-3 py-4 backdrop-blur-sm"
          >
            <p className="font-mono text-2xl font-bold text-white tabular-nums">
              {String(u.value).padStart(2, '0')}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50">{u.label}</p>
          </div>
        ))}
      </motion.div>

      {done && (
        <motion.p
          className="mt-8 text-lg font-medium"
          style={{ color: theme.accent }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          Vreme je isteklo!
        </motion.p>
      )}
    </div>
  )
}
