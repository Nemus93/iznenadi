'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import PhoneFrame from '@/components/experience/PhoneFrame'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { UnlockPhonePayload } from '@/lib/types/unlock-phone'

interface UnlockSceneProps {
  data: UnlockPhonePayload
  onComplete: () => void
}

export default function UnlockScene({ data, onComplete }: UnlockSceneProps) {
  const theme = useExperienceTheme()

  useEffect(() => {
    const timer = setTimeout(onComplete, 2200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 py-8"
      style={{ background: sceneBackground(theme) }}
    >
      <PhoneFrame wallpaper={sceneBackground(theme)}>
        <motion.div
          className="flex min-h-[min(640px,78dvh)] flex-col items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-4xl backdrop-blur-sm"
              animate={{
                boxShadow: [
                  `0 0 0 0 ${theme.glow}`,
                  `0 0 40px 8px ${theme.glow}`,
                  `0 0 0 0 ${theme.glow}`,
                ],
              }}
              transition={{ duration: 1.2, repeat: 2 }}
            >
              🔓
            </motion.div>
          </motion.div>

          <motion.p
            className="mt-8 font-serif text-2xl font-bold text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ textShadow: `0 0 30px ${theme.glow}` }}
          >
            Telefon otključan
          </motion.p>

          <motion.p
            className="mt-2 text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Poruka od {data.senderName} je spremna...
          </motion.p>
        </motion.div>
      </PhoneFrame>
    </div>
  )
}
