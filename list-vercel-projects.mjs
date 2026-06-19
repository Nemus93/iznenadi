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

const token = env.VERCEL_TOKEN
const qs = ''

async function api(path, options = {}) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const body = await res.text()
  const json = body ? JSON.parse(body) : null
  if (!res.ok) throw new Error(`${path} ${res.status}: ${body}`)
  return json
}

const user = await api('/v2/user')
const teamId = user.defaultTeamId
const teamQs = teamId ? `?teamId=${teamId}` : ''
const projects = await api(`/v9/projects${teamQs}`)

for (const name of ['web', 'iznenadi']) {
  const p = projects.projects.find((x) => x.name === name)
  if (!p) continue
  const detail = await api(`/v9/projects/${p.id}${teamQs}`)
  console.log(`\n=== ${name} ===`)
  console.log('id:', p.id)
  console.log('link:', detail.link?.type, detail.link?.repo, detail.link?.repoId)
  console.log('rootDirectory:', detail.rootDirectory ?? '(root)')
  const latest = await api(`/v6/deployments?projectId=${p.id}&limit=1${teamId ? `&teamId=${teamId}` : ''}`)
  const d = latest.deployments?.[0]
  if (d) console.log('latest:', d.readyState, d.url, d.meta?.githubCommitSha?.slice(0, 7))
}
