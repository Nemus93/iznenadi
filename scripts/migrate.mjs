/**
 * Proveri Supabase stanje i pokreni migracije.
 * Env u .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (obavezno)
 *   SUPABASE_DB_URL ili SUPABASE_DB_PASSWORD (za DDL)
 *   SUPABASE_ACCESS_TOKEN (alternativa — Management API SQL)
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

function loadEnvLocal() {
  const path = join(root, '.env.local')
  const text = readFileSync(path, 'utf8')
  const env = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return env
}

function projectRefFromUrl(url) {
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return m?.[1] ?? null
}

async function runSqlViaManagementApi(accessToken, projectRef, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const body = await res.text()
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${body}`)
  }
  return body
}

async function runSqlViaPg(dbUrl, sql) {
  const { default: pg } = await import('pg')
  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()
  try {
    await client.query(sql)
  } finally {
    await client.end()
  }
}

async function main() {
  const env = loadEnvLocal()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  const projectRef = projectRefFromUrl(url ?? '')

  if (!url || !serviceKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY moraju biti u .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let needInit = false
  let needPayment = false

  const probe = await supabase.from('surprises').select('slug').limit(1)
  if (!probe.error) {
    console.log('OK: tabela surprises postoji')
    const cols = await supabase.from('surprises').select('tier, payment_status').limit(1)
    if (cols.error?.message?.includes('payment_status')) {
      needPayment = true
      console.log('NEED: migracija payment_status')
    } else if (!cols.error) {
      console.log('OK: kolone tier/payment_status')
    }
  } else {
    console.log('surprises:', probe.error.message)
    needInit = true
  }

  const { data: buckets } = await supabase.storage.listBuckets()
  const hasBucket = buckets?.some((b) => b.name === 'surprise-photos')
  console.log(hasBucket ? 'OK: bucket surprise-photos' : 'NEED: bucket surprise-photos')

  const migrationsDir = join(root, 'supabase', 'migrations')
  const files = []
  if (needInit) {
    files.push(
      '20260615160000_init_surprises.sql',
      '20260615170000_add_tier.sql',
      '20260616180000_add_payment.sql'
    )
  } else if (needPayment) {
    files.push('20260616180000_add_payment.sql')
  }

  if (files.length === 0) {
    console.log('Nema migracija za primenu.')
    return
  }

  const dbUrl =
    env.SUPABASE_DB_URL ||
    (env.SUPABASE_DB_PASSWORD && projectRef
      ? `postgresql://postgres.${projectRef}:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
      : null)

  const accessToken = env.SUPABASE_ACCESS_TOKEN

  if (!dbUrl && !accessToken) {
    console.error('\nDodaj u .env.local jedno od:')
    console.error('  SUPABASE_DB_PASSWORD=... (database password iz Supabase dashboard)')
    console.error('  SUPABASE_DB_URL=postgresql://... (puni connection string)')
    console.error('  SUPABASE_ACCESS_TOKEN=sbp_... (Account → Access Tokens)')
    process.exit(2)
  }

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    console.log(`Running ${file}...`)
    if (dbUrl) {
      await runSqlViaPg(dbUrl, sql)
    } else if (accessToken && projectRef) {
      await runSqlViaManagementApi(accessToken, projectRef, sql)
    }
    console.log(`Done ${file}`)
  }

  console.log('Migracije primenjene.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
