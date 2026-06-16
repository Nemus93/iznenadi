import { z } from 'zod'
import { customColorsSchema, THEMES, type ExperienceSceneData } from './experience'
import { quizQuestionSchema } from './secret-quiz-types'

export type { QuizQuestion } from './secret-quiz-types'
export { quizQuestionSchema } from './secret-quiz-types'

export const secretQuizPayloadSchema = z.object({
  recipientName: z.string().min(1).max(50),
  senderName: z.string().min(1).max(50),
  occasion: z.string().min(1).max(100),
  quizQuestions: z.array(quizQuestionSchema).min(3).max(5),
  photos: z.array(z.string().url()).min(1).max(5),
  mainMessage: z.string().min(10).max(2000),
  finaleText: z.string().min(1).max(200),
  themeMode: z.enum(['preset', 'custom']).default('preset'),
  theme: z.enum(THEMES),
  customColors: customColorsSchema.optional(),
  tier: z.literal('premium').default('premium'),
})

export type SecretQuizPayload = z.infer<typeof secretQuizPayloadSchema>

export const quizCreateFormSchema = z
  .object({
    recipientName: z.string().min(1, 'Unesi ime primaoca').max(50),
    senderName: z.string().min(1, 'Unesi svoje ime').max(50),
    occasion: z.string().min(1, 'Unesi povod').max(100),
    quizQuestions: z
      .array(
        z.object({
          question: z.string().min(1, 'Pitanje ne sme biti prazno').max(200),
          answer: z.string().min(1, 'Tačan odgovor ne sme biti prazan').max(100),
          hint: z.string().max(100).optional(),
        })
      )
      .min(3)
      .max(5),
    mainMessage: z.string().min(10, 'Poruka mora imati bar 10 karaktera').max(2000),
    finaleText: z.string().min(1, 'Unesi završni tekst').max(200),
    themeMode: z.enum(['preset', 'custom']),
    theme: z.enum(THEMES),
    customColors: customColorsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.themeMode === 'custom' && !data.customColors) {
      ctx.addIssue({
        code: 'custom',
        message: 'Izaberi custom boje',
        path: ['customColors'],
      })
    }
  })

export type QuizCreateFormValues = z.infer<typeof quizCreateFormSchema>

export const defaultQuizCreateFormValues: QuizCreateFormValues = {
  recipientName: '',
  senderName: '',
  occasion: '',
  quizQuestions: [
    { question: '', answer: '', hint: '' },
    { question: '', answer: '', hint: '' },
    { question: '', answer: '', hint: '' },
  ],
  mainMessage: '',
  finaleText: '',
  themeMode: 'preset',
  theme: 'rose',
}

export function quizFormValuesToPayload(
  values: QuizCreateFormValues,
  photoUrls: string[]
): SecretQuizPayload {
  return {
    recipientName: values.recipientName.trim(),
    senderName: values.senderName.trim(),
    occasion: values.occasion.trim(),
    quizQuestions: values.quizQuestions.map((q) => ({
      question: q.question.trim(),
      answer: q.answer.trim(),
      hint: q.hint?.trim() || undefined,
    })),
    photos: photoUrls,
    mainMessage: values.mainMessage.trim(),
    finaleText: values.finaleText.trim(),
    themeMode: values.themeMode,
    theme: values.theme,
    customColors: values.themeMode === 'custom' ? values.customColors : undefined,
    tier: 'premium',
  }
}

export function secretQuizToSceneData(payload: SecretQuizPayload): ExperienceSceneData {
  return {
    recipientName: payload.recipientName,
    senderName: payload.senderName,
    occasion: payload.occasion,
    photos: payload.photos,
    mainMessage: payload.mainMessage,
    finaleText: payload.finaleText,
    themeMode: payload.themeMode,
    theme: payload.theme,
    customColors: payload.customColors,
    tier: payload.tier,
  }
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function answersMatch(userInput: string, correctAnswer: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(correctAnswer)
}
