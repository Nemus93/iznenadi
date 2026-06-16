'use client'

import { useState } from 'react'
import { ThemeProvider } from '@/components/experience/ThemeProvider'
import { tierSupportsLightbox } from '@/lib/templates/registry'
import { secretQuizToSceneData, type SecretQuizPayload } from '@/lib/types/secret-quiz'
import PhotosScene from '@/components/templates/LoveMessage/scenes/PhotosScene'
import MessageScene from '@/components/templates/LoveMessage/scenes/MessageScene'
import FinaleScene from '@/components/templates/LoveMessage/scenes/FinaleScene'
import IntroScene from './scenes/IntroScene'
import QuizScene from './scenes/QuizScene'

type Phase = 'intro' | 'quiz' | 'photos' | 'message' | 'finale'

interface SecretQuizProps {
  data: SecretQuizPayload
}

export default function SecretQuiz({ data }: SecretQuizProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const sceneData = secretQuizToSceneData(data)
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

  return (
    <ThemeProvider data={sceneData}>
      <div className="relative h-dvh w-full touch-manipulation overflow-hidden select-none">
        {phase === 'intro' && (
          <IntroScene data={data} onAdvance={() => setPhase('quiz')} />
        )}
        {phase === 'quiz' && (
          <QuizScene data={data} onComplete={() => setPhase('photos')} />
        )}
        {phase === 'photos' && (
          <PhotosScene
            {...loveMessageSceneProps}
            onAdvance={() => setPhase('message')}
          />
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
