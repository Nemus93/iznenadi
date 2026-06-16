import { z } from 'zod'

export const quizQuestionSchema = z.object({
  question: z.string().min(1, 'Pitanje ne sme biti prazno').max(200),
  answer: z.string().min(1, 'Tačan odgovor ne sme biti prazan').max(100),
  hint: z.string().max(100).optional(),
})

export type QuizQuestion = z.infer<typeof quizQuestionSchema>
