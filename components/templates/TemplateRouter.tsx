'use client'

import LoveMessage from '@/components/templates/LoveMessage'
import SecretQuiz from '@/components/templates/SecretQuiz'
import UnlockPhone from '@/components/templates/UnlockPhone'
import type { LoveMessagePayload, StoredPayload } from '@/lib/types/normalize-payload'
import type { SecretQuizPayload } from '@/lib/types/secret-quiz'
import type { UnlockPhonePayload } from '@/lib/types/unlock-phone'

interface TemplateRouterProps {
  template: string
  data: StoredPayload
}

export default function TemplateRouter({ template, data }: TemplateRouterProps) {
  switch (template) {
    case 'love_message':
      return <LoveMessage data={data as LoveMessagePayload} />
    case 'secret_quiz':
      return <SecretQuiz data={data as SecretQuizPayload} />
    case 'unlock_phone':
      return <UnlockPhone data={data as UnlockPhonePayload} />
    default:
      return (
        <div className="flex h-dvh items-center justify-center bg-black px-6 text-center text-white">
          <p>Template &ldquo;{template}&rdquo; još nije dostupan.</p>
        </div>
      )
  }
}
