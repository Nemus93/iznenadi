const RESEND_API = 'https://api.resend.com/emails'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.IZNENADI_NOTIFY_EMAIL)
}

export async function sendCustomRequestNotification(input: {
  name: string
  email: string
  description: string
  occasion?: string
  budget?: string
  deadline?: string
}): Promise<{ ok: true } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.IZNENADI_NOTIFY_EMAIL
  const from = process.env.RESEND_FROM_EMAIL ?? 'Iznenadi <onboarding@resend.dev>'

  if (!apiKey || !to) {
    return { error: 'Email nije konfigurisan (RESEND_API_KEY, IZNENADI_NOTIFY_EMAIL).' }
  }

  const lines = [
    `Ime: ${input.name}`,
    `Email: ${input.email}`,
    input.occasion ? `Povod: ${input.occasion}` : null,
    input.budget ? `Budžet: ${input.budget}` : null,
    input.deadline ? `Rok: ${input.deadline}` : null,
    '',
    'Opis:',
    input.description,
  ]
    .filter(Boolean)
    .join('\n')

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `[Iznenadi] Custom zahtev — ${input.name}`,
      text: lines,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    return { error: body || `Resend ${res.status}` }
  }

  return { ok: true }
}
