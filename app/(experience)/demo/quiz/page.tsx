import type { Metadata } from 'next'
import SecretQuiz from '@/components/templates/SecretQuiz'
import { demoQuizData } from '@/lib/demo-quiz-data'

export const metadata: Metadata = {
  title: 'Demo kviz — Iznenadi',
  description: 'Primer tajnog kviza ljubavi — odgovori tačno da otključaš poruku.',
}

export default function DemoQuizPage() {
  return <SecretQuiz data={demoQuizData} />
}
