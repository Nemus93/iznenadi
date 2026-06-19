/**
 * Automatski smoke test — statičke rute + health.
 * Usage: node scripts/smoke-test.mjs [BASE_URL]
 * Default: process.env.NEXT_PUBLIC_APP_URL ili http://localhost:3000
 */
const base = (process.argv[2] ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const routes = [
  '/',
  '/templates',
  '/demo',
  '/demo/quiz',
  '/demo/phone',
  '/create?template=love_message&tier=basic',
  '/create?template=love_message&tier=standard',
  '/create?template=secret_quiz&tier=premium',
  '/create?template=unlock_phone&tier=premium',
]

async function check(path, expectStatus = 200) {
  const url = `${base}${path}`
  const res = await fetch(url, { redirect: 'follow' })
  const ok = res.status === expectStatus
  console.log(`${ok ? 'OK' : 'FAIL'} ${res.status} ${url}`)
  return ok
}

async function main() {
  console.log(`Smoke test: ${base}\n`)
  let passed = 0
  for (const path of routes) {
    if (await check(path)) passed++
  }
  if (await check('/s/__smoke_nonexistent_slug__', 404)) passed++
  console.log(`\n${passed}/${routes.length + 1} provera OK`)
  if (passed < routes.length + 1) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
