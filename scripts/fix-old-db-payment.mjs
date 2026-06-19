/**
 * Hitni fix: payment_status na starom zajedničkom projektu (dok redeploy ne prebaci na novi).
 * Usage: node scripts/fix-old-db-payment.mjs
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const token = env.SUPABASE_ACCESS_TOKEN
const oldRef = 'tozyxkxmsyhyeznehjtx'
const sql = readFileSync(
  join(root, 'supabase/migrations/20260616180000_add_payment.sql'),
  'utf8'
)

const res = await fetch(`https://api.supabase.com/v1/projects/${oldRef}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
})
const body = await res.text()
console.log(`Migracija na ${oldRef}: ${res.status}`)
console.log(body.slice(0, 300))
