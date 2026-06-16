'use client'

import { useEffect } from 'react'
import LoveMessage from '@/components/templates/LoveMessage'
import SecretQuiz from '@/components/templates/SecretQuiz'
import UnlockPhone from '@/components/templates/UnlockPhone'
import type { LoveMessagePayload, StoredPayload } from '@/lib/types/normalize-payload'
import type { SecretQuizPayload } from '@/lib/types/secret-quiz'
import type { UnlockPhonePayload } from '@/lib/types/unlock-phone'

interface ExperiencePreviewModalProps {
  template?: 'love_message' | 'secret_quiz' | 'unlock_phone'
  data: StoredPayload
  open: boolean
  onClose: () => void
}

export default function ExperiencePreviewModal({
  template = 'love_message',
  data,
  open,
  onClose,
}: ExperiencePreviewModalProps) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const resolvedTemplate =
    template === 'unlock_phone' || 'notifications' in data
      ? 'unlock_phone'
      : template === 'secret_quiz' || 'quizQuestions' in data
        ? 'secret_quiz'
        : 'love_message'

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-[210] rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
      >
        Zatvori pregled
      </button>
      {resolvedTemplate === 'unlock_phone' ? (
        <UnlockPhone data={data as UnlockPhonePayload} />
      ) : resolvedTemplate === 'secret_quiz' ? (
        <SecretQuiz data={data as SecretQuizPayload} />
      ) : (
        <LoveMessage data={data as LoveMessagePayload} />
      )}
    </div>
  )
}
