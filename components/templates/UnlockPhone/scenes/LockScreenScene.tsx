'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PhoneFrame from '@/components/experience/PhoneFrame'
import NotificationBanner from '@/components/experience/NotificationBanner'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import type { UnlockPhonePayload } from '@/lib/types/unlock-phone'

interface LockScreenSceneProps {
  data: UnlockPhonePayload
  readCount: number
  onOpenNotification: (index: number) => void
  onUnlock: () => void
}

function formatLockTime(date: Date) {
  return date.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
}

function formatLockDate(date: Date) {
  return date.toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function LockScreenScene({
  data,
  readCount,
  onOpenNotification,
  onUnlock,
}: LockScreenSceneProps) {
  const theme = useExperienceTheme()
  const [now, setNow] = useState(() => new Date())
  const allRead = readCount >= data.notifications.length
  const visibleNotifications = data.notifications.slice(0, readCount + 1)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 py-8"
      style={{ background: sceneBackground(theme) }}
    >
      <PhoneFrame wallpaper={sceneBackground(theme)}>
        <div className="relative flex h-full min-h-[min(640px,78dvh)] flex-col px-4 pt-12 pb-8">
          <div className="text-center">
            <p className="font-light text-6xl tracking-tight text-white">{formatLockTime(now)}</p>
            <p className="mt-1 text-sm text-white/60">{formatLockDate(now)}</p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {visibleNotifications.map((notification, index) => {
              const isUnread = index === readCount && !allRead

              return (
                <NotificationBanner
                  key={index}
                  title={notification.title}
                  body={notification.body}
                  appIcon={index === data.notifications.length - 1 ? '🔓' : '💌'}
                  index={index}
                  onClick={() => {
                    if (isUnread) onOpenNotification(index)
                  }}
                />
              )
            })}
          </div>

          <div className="mt-auto flex flex-col items-center gap-3">
            {allRead ? (
              <motion.button
                type="button"
                onClick={onUnlock}
                className="flex flex-col items-center gap-2 text-white/70"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="h-1 w-32 rounded-full bg-white/30"
                  animate={{ scaleX: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs tracking-widest uppercase">Swipe up · otključaj</span>
              </motion.button>
            ) : (
              <p className="text-xs text-white/40">Otvori notifikacije jedna po jedna</p>
            )}
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}
