import { z } from 'zod'

export const phoneNotificationSchema = z.object({
  title: z.string().min(1, 'Naslov ne sme biti prazan').max(50),
  body: z.string().min(1, 'Tekst ne sme biti prazan').max(300),
  photoIndex: z.number().int().min(0).optional(),
})

export type PhoneNotification = z.infer<typeof phoneNotificationSchema>
