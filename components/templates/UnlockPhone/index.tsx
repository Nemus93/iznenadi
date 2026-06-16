'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from '@/components/experience/ThemeProvider'
import NotificationDetail from '@/components/experience/NotificationDetail'
import { tierSupportsLightbox } from '@/lib/templates/registry'
import { unlockPhoneToSceneData, type UnlockPhonePayload } from '@/lib/types/unlock-phone'
import MessageScene from '@/components/templates/LoveMessage/scenes/MessageScene'
import FinaleScene from '@/components/templates/LoveMessage/scenes/FinaleScene'
import IntroScene from './scenes/IntroScene'
import LockScreenScene from './scenes/LockScreenScene'
import UnlockScene from './scenes/UnlockScene'

type Phase = 'intro' | 'lock' | 'unlock' | 'message' | 'finale'

interface UnlockPhoneProps {
  data: UnlockPhonePayload
}

export default function UnlockPhone({ data }: UnlockPhoneProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [readCount, setReadCount] = useState(0)
  const [activeNotification, setActiveNotification] = useState<number | null>(null)

  const sceneData = unlockPhoneToSceneData(data)
  const enableLightbox = tierSupportsLightbox(data.tier)

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
        {phase === 'intro' && (
          <IntroScene data={data} onAdvance={() => setPhase('lock')} />
        )}

        {phase === 'lock' && (
          <>
            <LockScreenScene
              data={data}
              readCount={readCount}
              onOpenNotification={(index) => setActiveNotification(index)}
              onUnlock={() => setPhase('unlock')}
            />
            <AnimatePresence>
              {activeNotification !== null && (
                <NotificationDetail
                  title={data.notifications[activeNotification].title}
                  body={data.notifications[activeNotification].body}
                  imageUrl={getNotificationImage(activeNotification)}
                  appIcon={
                    activeNotification === data.notifications.length - 1 ? '🔓' : '💌'
                  }
                  onDismiss={handleNotificationDismiss}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {phase === 'unlock' && (
          <UnlockScene data={data} onComplete={() => setPhase('message')} />
        )}

        {phase === 'message' && (
          <MessageScene
            {...loveMessageSceneProps}
            onAdvance={() => setPhase('finale')}
          />
        )}

        {phase === 'finale' && (
          <FinaleScene {...loveMessageSceneProps} isLastScene />
        )}
      </div>
    </ThemeProvider>
  )
}
