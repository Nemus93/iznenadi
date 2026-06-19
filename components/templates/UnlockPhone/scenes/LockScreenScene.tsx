'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import PhoneFrame from '@/components/experience/PhoneFrame'
import NotificationBanner from '@/components/experience/NotificationBanner'
import { iconVariantForIndex } from '@/components/experience/AppIcon'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { feedbackOnNotification } from '@/lib/hooks/use-notification-feedback'
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
  const dragY = useMotionValue(0)
  const unlockOpacity = useTransform(dragY, [-120, -40], [1, 0.3])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (readCount > 0 && readCount <= data.notifications.length) {
      feedbackOnNotification()
    }
  }, [readCount, data.notifications.length])

  function handleDragEnd() {
    if (dragY.get() < -80) {
      onUnlock()
    } else {
      animate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-2 py-6 sm:px-4"
      style={{ background: sceneBackground(theme) }}
    >
      <PhoneFrame wallpaper={sceneBackground(theme)} fullBleed>
        <div className="relative flex h-full min-h-dvh flex-col px-4 pt-14 pb-10">
          <div className="text-center">
            <p className="font-extralight text-7xl tracking-tight text-white tabular-nums">
              {formatLockTime(now)}
            </p>
            <p className="mt-1 text-sm capitalize text-white/55">{formatLockDate(now)}</p>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            {visibleNotifications.map((notification, index) => {
              const isUnread = index === readCount && !allRead
              const dimmed = index < readCount

              return (
                <NotificationBanner
                  key={index}
                  title={notification.title}
                  body={notification.body}
                  iconVariant={iconVariantForIndex(index, data.notifications.length)}
                  index={index}
                  dimmed={dimmed}
                  onClick={() => {
                    if (isUnread) onOpenNotification(index)
                  }}
                />
              )
            })}
          </div>

          <div className="mt-auto flex flex-col items-center gap-4 pt-6">
            {allRead ? (
              <motion.div
                style={{ opacity: unlockOpacity }}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  drag="y"
                  dragConstraints={{ top: -140, bottom: 0 }}
                  dragElastic={0.15}
                  style={{ y: dragY }}
                  onDragEnd={handleDragEnd}
                  className="flex cursor-grab flex-col items-center gap-2 touch-none active:cursor-grabbing"
                >
                  <div className="h-1 w-36 rounded-full bg-white/40" />
                  <span className="text-xs tracking-widest text-white/70 uppercase">
                    Prevuci nagore
                  </span>
                </motion.div>
                <button
                  type="button"
                  onClick={onUnlock}
                  className="text-[10px] text-white/40 underline"
                >
                  ili tapni ovde
                </button>
              </motion.div>
            ) : (
              <p className="text-xs text-white/45">Otvori notifikacije jedna po jedna</p>
            )}
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}
