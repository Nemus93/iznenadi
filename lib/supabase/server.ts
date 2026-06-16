import { createClient } from '@supabase/supabase-js'

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

/** Service-role client for trusted server operations (insert, storage upload). */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase nije konfigurisan. Postavi NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local'
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Anon client for public reads (slug pages). */
export function createSupabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase nije konfigurisan. Postavi NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY u .env.local'
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
