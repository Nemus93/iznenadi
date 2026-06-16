import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export function generateSurpriseSlug(): string {
  return nanoid()
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

export function getSurpriseUrl(slug: string): string {
  return `${getAppUrl()}/s/${slug}`
}
