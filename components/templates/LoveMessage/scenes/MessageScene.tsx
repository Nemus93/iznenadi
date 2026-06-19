'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { SceneProps } from '../types'

function useTypewriter(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    setDisplayed('')
    setDone(false)
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  function skip() {
    setDisplayed(text)
    setDone(true)
  }

  return { displayed, done, skip }
}

export default function MessageScene({ data, onAdvance }: SceneProps) {
  const theme = useExperienceTheme()

  return (
    <MessageSceneBody
      key={data.mainMessage}
      data={data}
      theme={theme}
      onAdvance={onAdvance}
    />
  )
}

function MessageSceneBody({
  data,
  theme,
  onAdvance,
}: {
  data: SceneProps['data']
  theme: ReturnType<typeof useExperienceTheme>
  onAdvance: SceneProps['onAdvance']
}) {
  const { displayed, done, skip } = useTypewriter(data.mainMessage, 32)

  function handleTap() {
    if (done) {
      onAdvance()
      return
    }
    skip()
  }

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: sceneBackground(theme) }}
      onClick={handleTap}
    >
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 500,
          height: 300,
          background: `radial-gradient(ellipse, ${theme.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="mb-2 text-xs tracking-[0.3em] uppercase"
            style={{ color: theme.accentMuted }}
          >
            posebna poruka
          </p>
          <h2 className="font-serif text-3xl font-bold text-white">Za tebe ♥</h2>
        </motion.div>

        <motion.div
          className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div
            className="-mt-1 mb-2 font-serif text-5xl leading-none"
            style={{ color: `${theme.accent}66` }}
          >
            &ldquo;
          </div>
          <p className="text-base leading-relaxed font-light text-white/90">
            {displayed}
            {!done && (
              <motion.span
                className="ml-0.5 inline-block h-4 w-0.5 align-middle"
                style={{ backgroundColor: theme.accent }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </p>
          <div
            className="mt-1 text-right font-serif text-5xl leading-none"
            style={{ color: `${theme.accent}66` }}
          >
            &rdquo;
          </div>
        </motion.div>

        {done && (
          <motion.p
            className="text-center text-sm"
            style={{ color: theme.accentMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            — {data.senderName}
          </motion.p>
        )}
      </div>

      <motion.p
        className="absolute bottom-16 text-xs tracking-widest uppercase"
        style={{ color: theme.accentMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {done ? 'tapni za finale' : 'tapni da preskočiš pisanje'}
      </motion.p>
    </div>
  )
}
