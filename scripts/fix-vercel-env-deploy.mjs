/**
 * Sinhronizuje Vercel production env iz .env.local i redeploy-uje.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const envPath = join(root, '.env.local')

function loadEnv() {
  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return env
}

const KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_PAYMENTS_ENABLED',
  'NEXT_PUBLIC_APP_URL',
]

const env = loadEnv()
const token = env.VERCEL_TOKEN
if (!token) {
  console.error('VERCEL_TOKEN nedostaje')
  process.exit(1)
}

const projectId = 'prj_UIw6k8Be9Mj8zGgMipr3FIC2rHKq'
const appUrl = 'https://web-beta-umber-59.vercel.app'

async function api(path, options = {}) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${path} ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

async function deleteEnv(key) {
  const list = await api(`/v9/projects/${projectId}/env`)
  const item = list.envs?.find((e) => e.key === key && e.target?.includes('production'))
  if (item) {
    await api(`/v9/projects/${projectId}/env/${item.id}`, { method: 'DELETE' })
    console.log(`Obrisano: ${key}`)
  }
}

async function addEnv(key, value) {
  await api(`/v10/projects/${projectId}/env`, {
    method: 'POST',
    body: JSON.stringify({
      key,
      value,
      type: key.includes('SERVICE_ROLE') || key.includes('SECRET') ? 'encrypted' : 'plain',
      target: ['production', 'preview'],
    }),
  })
  console.log(`Dodato: ${key}`)
}

const values = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_PAYMENTS_ENABLED: env.STRIPE_PAYMENTS_ENABLED ?? 'false',
  NEXT_PUBLIC_APP_URL: appUrl,
}

for (const key of KEYS) {
  await deleteEnv(key)
  await addEnv(key, values[key])
}

const ref = values.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase/)?.[1]
console.log(`\nVercel env → Supabase ref: ${ref}`)

console.log('\nRedeploy...')
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const deploy = spawnSync(
  npx,
  ['vercel@latest', 'deploy', '--prod', '--yes', '--token', token, '--cwd', root],
  { stdio: 'inherit', cwd: root }
)
process.exit(deploy.status ?? 1)
