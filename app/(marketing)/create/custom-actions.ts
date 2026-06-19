'use server'

import { z } from 'zod'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { sendCustomRequestNotification } from '@/lib/email'

const customRequestSchema = z.object({
  name: z.string().min(2, 'Unesi ime').max(80),
  email: z.string().email('Unesi ispravan email'),
  description: z.string().min(20, 'Opiši ideju bar u 20 karaktera').max(3000),
  occasion: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  deadline: z.string().max(100).optional(),
})

export type CustomRequestResult = { ok: true } | { error: string }

export async function submitCustomRequestAction(
  formData: FormData
): Promise<CustomRequestResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase nije konfigurisan.' }
  }

  const parsed = customRequestSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    description: formData.get('description'),
    occasion: formData.get('occasion') || undefined,
    budget: formData.get('budget') || undefined,
    deadline: formData.get('deadline') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Proveri polja.' }
  }

  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('custom_requests').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    description: parsed.data.description,
    occasion: parsed.data.occasion ?? null,
    budget: parsed.data.budget ?? null,
    deadline: parsed.data.deadline ?? null,
    status: 'pending',
  })

  if (error) {
    return { error: error.message }
  }

  await sendCustomRequestNotification(parsed.data)

  return { ok: true }
}
