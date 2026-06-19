/**
 * Twilio SMS — optional; when unset, jobs stay pending (no send).
 */

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
  )
}

export function normalizePhoneE164(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let digits = trimmed.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)

  if (digits.startsWith('381') && digits.length >= 11 && digits.length <= 12) {
    return `+${digits}`
  }
  if (digits.startsWith('0') && digits.length >= 9 && digits.length <= 10) {
    return `+381${digits.slice(1)}`
  }
  if (digits.length >= 8 && digits.length <= 9) {
    return `+381${digits}`
  }
  if (trimmed.startsWith('+') && digits.length >= 10) {
    return `+${digits}`
  }

  return null
}

export async function sendSms(
  to: string,
  body: string
): Promise<{ sid: string } | { error: string }> {
  if (!isSmsConfigured()) {
    return { error: 'SMS nije konfigurisan (Twilio env vars).' }
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!
  const token = process.env.TWILIO_AUTH_TOKEN!
  const from = process.env.TWILIO_FROM_NUMBER!

  const params = new URLSearchParams({
    To: to,
    From: from,
    Body: body.slice(0, 1600),
  })

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  )

  const json = (await res.json()) as { sid?: string; message?: string }
  if (!res.ok) {
    return { error: json.message ?? `Twilio ${res.status}` }
  }

  return { sid: json.sid ?? 'unknown' }
}

export function formatSmsTeaser(title: string, body: string, senderName: string): string {
  const teaser = `${title}: ${body}`.replace(/\s+/g, ' ').trim()
  const max = 120
  const clipped = teaser.length > max ? `${teaser.slice(0, max - 1)}…` : teaser
  return `${clipped}\n— Poruka od ${senderName} preko Iznenadi`
}

export function formatSmsLink(link: string, senderName: string): string {
  return `Otvori iznenađenje: ${link}\n— ${senderName} preko Iznenadi`
}
