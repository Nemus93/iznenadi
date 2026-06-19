/**
 * Postavi Vercel env vars i pokreni production deploy.
 *
 * Preduslov u iznenadi/web/.env.local:
 *   VERCEL_TOKEN=...           (https://vercel.com/account/tokens)
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *
 * Opciono:
 *   VERCEL_PROJECT_NAME=iznenadi
 *   NEXT_PUBLIC_APP_URL=https://iznenadi.vercel.app  (posle prvog deploya — redeploy)
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const envPath = join(root, '.env.local')

function loadEnvLocal() {
  if (!existsSync(envPath)) return {}
  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
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
  await vercelApi(token, `/v10/projects/${projectId}/env${qs}`, {
    method: 'POST',
    body: JSON.stringify({
      key,
      value,
      type: key.includes('SERVICE_ROLE') || key.includes('SECRET') ? 'encrypted' : 'plain',
      target,
    }),
  })
}

async function main() {
  const env = loadEnvLocal()
  const token = env.VERCEL_TOKEN ?? process.env.VERCEL_TOKEN
  if (!token) {
    console.error('Dodaj VERCEL_TOKEN u .env.local (https://vercel.com/account/tokens)')
    process.exit(1)
  }

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  for (const key of required) {
    if (!env[key]) {
      console.error(`Nedostaje ${key} u .env.local`)
      process.exit(1)
    }
  }

  const user = await vercelApi(token, '/v2/user')
  const teamId = user.defaultTeamId ?? null
  const projectName = env.VERCEL_PROJECT_NAME ?? 'iznenadi'

  let project
  const listQs = teamId ? `?teamId=${teamId}` : ''
  const projects = await vercelApi(token, `/v9/projects${listQs}`)
  project = projects.projects?.find((p) => p.name === projectName)

  if (!project) {
    console.log(`Kreiram Vercel projekat "${projectName}"...`)
    const created = await vercelApi(token, `/v11/projects${listQs}`, {
      method: 'POST',
      body: JSON.stringify({
        name: projectName,
        framework: 'nextjs',
        gitRepository: {
          type: 'github',
          repo: 'Nemus93/iznenadi',
        },
      }),
    })
    project = created
  }

  const projectId = project.id
  console.log(`Projekat: ${project.name} (${projectId})`)

  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_PAYMENTS_ENABLED: env.STRIPE_PAYMENTS_ENABLED ?? 'false',
    NEXT_PUBLIC_APP_URL:
      env.NEXT_PUBLIC_APP_URL?.startsWith('https://')
        ? env.NEXT_PUBLIC_APP_URL
        : `https://${projectName}.vercel.app`,
  }

  for (const [key, value] of Object.entries(vars)) {
    try {
      await upsertEnv(token, projectId, teamId, key, value)
      console.log(`Env: ${key}`)
    } catch (e) {
      const msg = String(e)
      if (msg.includes('already exists') || msg.includes('ENV_ALREADY_EXISTS')) {
        console.log(`Env postoji: ${key} (preskačem)`)
      } else {
        throw e
      }
    }
  }

  console.log('\nDeploy preko Vercel Git integracije.')
  console.log('Ako repo nije povezan: vercel.com → Import → Nemus93/iznenadi')
  console.log(`URL: https://${projectName}.vercel.app`)
  console.log('\nPosle prvog deploya proveri NEXT_PUBLIC_APP_URL i uradi Redeploy ako treba.')

  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const deploy = spawnSync(
    npx,
    ['vercel@latest', 'deploy', '--prod', '--yes', '--token', token, '--cwd', root],
    { stdio: 'inherit', env: { ...process.env, VERCEL_TOKEN: token } }
  )
  if (deploy.status !== 0) {
    console.error('CLI deploy nije uspeo — koristi Git push auto-deploy sa GitHub-a.')
    process.exit(deploy.status ?? 1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
