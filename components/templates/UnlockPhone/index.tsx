'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from '@/components/experience/ThemeProvider'
import NotificationDetail from '@/components/experience/NotificationDetail'
import { iconVariantForIndex } from '@/components/experience/AppIcon'
import { tierSupportsLightbox } from '@/lib/templates/registry'
import { unlockPhoneToSceneData, type UnlockPhonePayload } from '@/lib/types/unlock-phone'
import MessageScene from '@/components/templates/LoveMessage/scenes/MessageScene'
import FinaleScene from '@/components/templates/LoveMessage/scenes/FinaleScene'
import IntroScene from './scenes/IntroScene'
import LockScreenScene from './scenes/LockScreenScene'
import UnlockScene from './scenes/UnlockScene'

type Phase = 'intro' | 'lock' | 'unlock' | 'message' | 'finale'

const PHASES: Phase[] = ['intro', 'lock', 'unlock', 'message', 'finale']

interface UnlockPhoneProps {
  data: UnlockPhonePayload
}

export default function UnlockPhone({ data }: UnlockPhoneProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [readCount, setReadCount] = useState(0)
  const [activeNotification, setActiveNotification] = useState<number | null>(null)

  const sceneData = unlockPhoneToSceneData(data)
  const enableLightbox = tierSupportsLightbox(data.tier)
  const phaseIndex = PHASES.indexOf(phase)

  const loveMessageSceneProps = {
    data: {
      ...sceneData,
      reasons: [],
    },
    onAdvance: () => {},
    isLastScene: false,
    enableLightbox,
  }

  function handleNotificationDismiss() {
    setActiveNotification(null)
    setReadCount((c) => c + 1)
  }

  function getNotificationImage(index: number) {
    const notification = data.notifications[index]
    if (notification.photoIndex === undefined) return undefined
    return data.photos[notification.photoIndex]
  }

  return (
    <ThemeProvider data={sceneData}>
      <div className="relative h-dvh w-full touch-manipulation overflow-hidden select-none">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <IntroScene data={data} onAdvance={() => setPhase('lock')} />
            </motion.div>
          )}

          {phase === 'lock' && (
            <motion.div
              key="lock"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <LockScreenScene
                data={data}
                readCount={readCount}
                onOpenNotification={(index) => setActiveNotification(index)}
                onUnlock={() => setPhase('unlock')}
              />
              <AnimatePresence>
                {activeNotification !== null && (
                  <NotificationDetail
                    embedded
                    title={data.notifications[activeNotification].title}
                    body={data.notifications[activeNotification].body}
                    imageUrl={getNotificationImage(activeNotification)}
                    iconVariant={iconVariantForIndex(
                      activeNotification,
                      data.notifications.length
                    )}
                    onDismiss={handleNotificationDismiss}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {phase === 'unlock' && (
            <motion.div
              key="unlock"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <UnlockScene data={data} onComplete={() => setPhase('message')} />
            </motion.div>
          )}

          {phase === 'message' && (
            <motion.div
              key="message"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <MessageScene
                {...loveMessageSceneProps}
                onAdvance={() => setPhase('finale')}
              />
            </motion.div>
          )}

          {phase === 'finale' && (
            <motion.div
              key="finale"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FinaleScene
                {...loveMessageSceneProps}
                isLastScene
                templateLabel="Otključaj telefon"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-50 flex justify-center gap-2">
          {PHASES.map((p, i) => (
            <div
              key={p}
              className={`h-1.5 rounded-full transition-all ${
                i <= phaseIndex ? 'w-6 bg-pink-400' : 'w-1.5 bg-white/25'
              }`}
            />
          ))}
        </div>
      </div>
    </ThemeProvider>
  )
}
