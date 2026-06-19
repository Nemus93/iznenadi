import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const env = {}
for (const line of readFileSync(join(__dir, '..', '.env.local'), 'utf8').split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
}

const id = process.argv[2] ?? 'dpl_95GVEki6h6dcx17RpKxrXwsbGqkU'
const token = env.VERCEL_TOKEN

const res = await fetch(`https://api.vercel.com/v2/deployments/${id}/events?limit=30`, {
  headers: { Authorization: `Bearer ${token}` },
})
const events = await res.json()
for (const e of events ?? []) {
  if (e.type === 'stderr' || e.type === 'stdout' || e.type === 'error') {
    const text = (e.payload?.text ?? e.text ?? '').trim()
    if (text) console.log(text)
  }
}
