import { readFileSync } from 'node:fs'
import pg from 'pg'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1)
}

const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1]
const enc = encodeURIComponent(env.SUPABASE_DB_PASSWORD ?? '')
const regions = ['eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'us-east-1']

async function tryUrl(label, url) {
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query('select 1')
    console.log('OK', label)
    await client.end()
    return true
  } catch (e) {
    console.log('FAIL', label, e.message)
    try {
      await client.end()
    } catch {
      /* ignore */
    }
    return false
  }
}

for (const r of regions) {
  const ok6543 = await tryUrl(
    `pooler6543 ${r}`,
    `postgresql://postgres.${ref}:${enc}@aws-0-${r}.pooler.supabase.com:6543/postgres`
  )
  if (ok6543) process.exit(0)
  const ok5432 = await tryUrl(
    `pooler5432 ${r}`,
    `postgresql://postgres.${ref}:${enc}@aws-0-${r}.pooler.supabase.com:5432/postgres`
  )
  if (ok5432) process.exit(0)
}

console.log('No connection worked')
process.exit(1)
