import { loveMessagePayloadSchema, type LoveMessagePayload } from './surprise'
import { secretQuizPayloadSchema, type SecretQuizPayload } from './secret-quiz'
import { unlockPhonePayloadSchema, type UnlockPhonePayload } from './unlock-phone'

export type StoredPayload = LoveMessagePayload | SecretQuizPayload | UnlockPhonePayload

export type { LoveMessagePayload, SecretQuizPayload, UnlockPhonePayload }

export function normalizePayload(
  raw: unknown,
  template: string = 'love_message'
): StoredPayload | null {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as Record<string, unknown>
  const normalized = {
    ...data,
    themeMode: data.themeMode ?? 'preset',
    tier:
      data.tier ??
      (template === 'secret_quiz' || template === 'unlock_phone' ? 'premium' : 'basic'),
  }

  if (template === 'unlock_phone' || Array.isArray(data.notifications)) {
    const parsed = unlockPhonePayloadSchema.safeParse(normalized)
    return parsed.success ? parsed.data : null
  }

  if (template === 'secret_quiz' || Array.isArray(data.quizQuestions)) {
    const parsed = secretQuizPayloadSchema.safeParse(normalized)
    return parsed.success ? parsed.data : null
  }

  const parsed = loveMessagePayloadSchema.safeParse(normalized)
  return parsed.success ? parsed.data : null
}
