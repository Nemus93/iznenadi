/**
 * Postavi env vars na Vercel projekat (bez deploy-a).
 * Env u .env.local: VERCEL_TOKEN, opciono VERCEL_PROJECT_NAME (default: web)
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

function loadEnvLocal() {
  if (!existsSync(join(root, '.env.local'))) return {}
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

async function vercelApi(token, path, options = {}) {
  const res = await fetch(`https://api.vercel.com${path}`, {
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
    throw new Error(`Vercel ${path} ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`)
  }
  return json
}

async function upsertEnv(token, projectId, teamId, key, value, target = ['production', 'preview']) {
  const qs = teamId ? `?teamId=${teamId}` : ''
  const encrypted =
    key.includes('SERVICE_ROLE') ||
    key.includes('SECRET') ||
    key.includes('TOKEN') ||
    key.includes('AUTH') ||
    key === 'CRON_SECRET'

  try {
    await vercelApi(token, `/v10/projects/${projectId}/env${qs}`, {
      method: 'POST',
      body: JSON.stringify({ key, value, type: encrypted ? 'encrypted' : 'plain', target }),
    })
    console.log(`+ ${key}`)
  } catch (e) {
    const msg = String(e)
    if (msg.includes('ENV_ALREADY_EXISTS') || msg.includes('already exists')) {
      console.log(`= ${key} (postoji)`)
    } else {
      throw e
    }
  }
}

async function main() {
  const env = loadEnvLocal()
  const token = env.VERCEL_TOKEN ?? process.env.VERCEL_TOKEN
  if (!token) {
    console.error('VERCEL_TOKEN nedostaje u .env.local')
    process.exit(1)
  }

  const user = await vercelApi(token, '/v2/user')
  const teamId = user.defaultTeamId ?? null
  const listQs = teamId ? `?teamId=${teamId}` : ''
  const projects = await vercelApi(token, `/v9/projects${listQs}`)
  const projectName = env.VERCEL_PROJECT_NAME ?? 'web'
  const project = projects.projects?.find((p) => p.name === projectName)

  if (!project) {
    console.error(`Projekat "${projectName}" nije pronađen. Dostupni:`)
    for (const p of projects.projects ?? []) {
      console.error(`  - ${p.name}`)
    }
    process.exit(1)
  }

  console.log(`Projekat: ${project.name} (${project.id})`)

  const appUrl =
    env.NEXT_PUBLIC_APP_URL?.startsWith('https://')
      ? env.NEXT_PUBLIC_APP_URL
      : 'https://web-beta-umber-59.vercel.app'

  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_PAYMENTS_ENABLED: env.STRIPE_PAYMENTS_ENABLED ?? 'false',
    NEXT_PUBLIC_APP_URL: appUrl,
    CRON_SECRET: env.CRON_SECRET,
    IZNENADI_NOTIFY_EMAIL: env.IZNENADI_NOTIFY_EMAIL ?? 'nemanjaobrenov@gmail.com',
    RESEND_FROM_EMAIL: env.RESEND_FROM_EMAIL ?? 'Iznenadi <onboarding@resend.dev>',
  }

  for (const key of ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER', 'RESEND_API_KEY']) {
    if (env[key]) vars[key] = env[key]
  }

  for (const [key, value] of Object.entries(vars)) {
    if (!value) {
      console.log(`! preskačem prazan ${key}`)
      continue
    }
    await upsertEnv(token, project.id, teamId, key, value)
  }

  console.log('\nEnv sync završen. Uradi Redeploy na Vercel dashboard-u ili git push.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
