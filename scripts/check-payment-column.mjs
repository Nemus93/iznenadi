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
const sql = `SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'surprises' AND column_name = 'payment_status'`

async function check(ref) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const body = await res.text()
  console.log(`${ref}: ${res.status} ${body}`)
}

for (const ref of ['tozyxkxmsyhyeznehjtx', 'wnfpsgrqlrikcihbefnl']) {
  await check(ref)
}
