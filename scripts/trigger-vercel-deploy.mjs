/**
 * Pokreni production deploy sa GitHub main (Vercel projekat "web").
 */
import { readFileSync, existsSync } from 'node:fs'
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
    throw new Error(`Vercel ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`)
  }
  return json
}

async function main() {
  const env = loadEnvLocal()
  const token = env.VERCEL_TOKEN
  if (!token) {
    console.error('VERCEL_TOKEN nedostaje')
    process.exit(1)
  }

  const user = await vercelApi(token, '/v2/user')
  const teamId = user.defaultTeamId ?? null
  const qs = teamId ? `?teamId=${teamId}` : ''
  const projects = await vercelApi(token, `/v9/projects${qs}`)
  const projectName = process.argv[2] ?? env.VERCEL_PROJECT_NAME ?? 'iznenadi'
  const project = projects.projects?.find((p) => p.name === projectName)
  if (!project) {
    console.error(`Projekat ${projectName} nije pronađen`)
    process.exit(1)
  }

  const projectDetail = await vercelApi(token, `/v9/projects/${project.id}${qs}`)
  const repoId = projectDetail.link?.repoId
  if (!repoId) {
    console.error('Projekat nije povezan sa GitHub repom. Vercel dashboard → Settings → Git.')
    process.exit(1)
  }

  const deployment = await vercelApi(token, `/v13/deployments${qs}`, {
    method: 'POST',
    body: JSON.stringify({
      name: project.name,
      project: project.id,
      target: 'production',
      gitSource: {
        type: 'github',
        repoId,
        ref: 'main',
      },
    }),
  })

  const url = deployment.url ? `https://${deployment.url}` : deployment.alias?.[0]
  console.log(`Deploy pokrenut: ${deployment.id}`)
  console.log(`URL: ${url ?? '(čekaj build)'}`)
  console.log(`Inspector: https://vercel.com/${user.username ?? 'dashboard'}/${project.name}/${deployment.id}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
