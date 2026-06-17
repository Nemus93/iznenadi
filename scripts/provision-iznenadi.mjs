/**
 * Kreira novi Supabase projekat za Iznenadi i primenjuje sve migracije.
 *
 * Preduslov u .env.local:
 *   SUPABASE_ACCESS_TOKEN=sbp_...  (https://supabase.com/dashboard/account/tokens)
 *
 * Opciono:
 *   IZNENADI_SUPABASE_ORG_ID=...   (inače koristi prvu org sa liste)
 *   IZNENADI_DB_PASSWORD=...       (inače generiše random)
 *   IZNENADI_PROJECT_NAME=iznenadi   (default)
 *   IZNENADI_REGION=eu-central-1     (default)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const envPath = join(root, '.env.local')

function loadEnvLocal() {
  if (!existsSync(envPath)) return {}
  const text = readFileSync(envPath, 'utf8')
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

function upsertEnvLocal(updates) {
  const lines = existsSync(envPath) ? readFileSync(envPath, 'utf8').split('\n') : []
  const map = new Map()
  const order = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    const key = trimmed.slice(0, i).trim()
    if (!map.has(key)) order.push(key)
    map.set(key, trimmed.slice(i + 1).trim())
  }

  for (const [key, value] of Object.entries(updates)) {
    if (!map.has(key)) order.push(key)
    map.set(key, value)
  }

  const out = order.map((key) => `${key}=${map.get(key)}`)
  writeFileSync(envPath, `${out.join('\n')}\n`, 'utf8')
}

async function api(token, path, options = {}) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const body = await res.text()
  let json
  try {
    json = body ? JSON.parse(body) : null
  } catch {
    json = body
  }
  if (!res.ok) {
    throw new Error(`API ${path} ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`)
  }
  return json
}

async function waitForHealthy(token, ref, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    const project = await api(token, `/projects/${ref}`)
    if (project.status === 'ACTIVE_HEALTHY') return project
    console.log(`Čekam projekat (${project.status})... ${i + 1}/${maxAttempts}`)
    await new Promise((r) => setTimeout(r, 15000))
  }
  throw new Error(`Projekat ${ref} nije ACTIVE_HEALTHY na vreme`)
}

async function runMigrations(token, ref) {
  const migrationsDir = join(root, 'supabase', 'migrations')
  const files = [
    '20260615160000_init_surprises.sql',
    '20260615170000_add_tier.sql',
    '20260616180000_add_payment.sql',
  ]
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    console.log(`Migracija: ${file}`)
    await api(token, `/projects/${ref}/database/query`, {
      method: 'POST',
      body: JSON.stringify({ query: sql }),
    })
  }
}

function randomPassword() {
  return randomBytes(18).toString('base64url')
}

async function main() {
  const env = loadEnvLocal()
  const token = env.SUPABASE_ACCESS_TOKEN ?? process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    console.error('Dodaj SUPABASE_ACCESS_TOKEN u .env.local')
    console.error('Generiši na: https://supabase.com/dashboard/account/tokens')
    process.exit(1)
  }

  const orgs = await api(token, '/organizations')
  if (!orgs?.length) throw new Error('Nema organizacija na nalogu')
  const orgId = env.IZNENADI_SUPABASE_ORG_ID ?? orgs[0].id
  const projectName = env.IZNENADI_PROJECT_NAME ?? 'iznenadi'
  const region = env.IZNENADI_REGION ?? 'eu-central-1'
  const dbPassword = env.IZNENADI_DB_PASSWORD ?? randomPassword()

  console.log(`Kreiram projekat "${projectName}" u org ${orgId} (${region})...`)
  const created = await api(token, '/projects', {
    method: 'POST',
    body: JSON.stringify({
      organization_id: orgId,
      name: projectName,
      db_pass: dbPassword,
      region,
    }),
  })

  const ref = created.id ?? created.ref
  if (!ref) throw new Error(`Neočekivan odgovor: ${JSON.stringify(created)}`)
  console.log(`Projekat kreiran: ${ref}`)

  await waitForHealthy(token, ref)

  const keys = await api(token, `/projects/${ref}/api-keys`)
  const anon = keys.find((k) => k.name === 'anon')?.api_key
  const service = keys.find((k) => k.name === 'service_role')?.api_key
  if (!anon || !service) throw new Error('API keys nisu dostupni')

  const url = `https://${ref}.supabase.co`
  console.log('Pokrećem migracije...')
  await runMigrations(token, ref)

  upsertEnvLocal({
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
    SUPABASE_DB_PASSWORD: dbPassword,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    STRIPE_PAYMENTS_ENABLED: env.STRIPE_PAYMENTS_ENABLED ?? 'false',
  })

  console.log('\nGotovo.')
  console.log(`  URL: ${url}`)
  console.log(`  Ref: ${ref}`)
  console.log('  .env.local ažuriran')
  console.log('\nSledeće: npm run migrate (provera) → npm run dev')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
