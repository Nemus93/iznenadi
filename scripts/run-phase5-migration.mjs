/**
 * One-shot: primeni 20260619120000_notification_jobs.sql preko Management API.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

function loadEnvLocal() {
  const env = {}
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return env
}

async function main() {
  const env = loadEnvLocal()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const token = env.SUPABASE_ACCESS_TOKEN
  const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

  if (!ref || !token) {
    console.error('Treba NEXT_PUBLIC_SUPABASE_URL i SUPABASE_ACCESS_TOKEN u .env.local')
    process.exit(1)
  }

  const sql = readFileSync(
    join(root, 'supabase', 'migrations', '20260619120000_notification_jobs.sql'),
    'utf8'
  )

  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  const body = await res.text()
  if (!res.ok) {
    console.error(`FAIL ${res.status}:`, body)
    process.exit(1)
  }

  console.log('Phase 5 migracija primenjena (notification_jobs, custom_requests, recipient_phone).')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
