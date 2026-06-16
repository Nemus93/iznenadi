import Link from 'next/link'
import { redirect } from 'next/navigation'
import { fulfillCheckoutSession } from '@/lib/checkout'
import { getSurpriseBySlug } from '@/lib/surprises'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import SharePanel from './SharePanel'

interface PageProps {
  searchParams: Promise<{ slug?: string; session_id?: string }>
}

export default async function DonePage({ searchParams }: PageProps) {
  const { slug, session_id } = await searchParams

  if (!slug) {
    redirect('/create')
  }

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-red-400">Supabase nije konfigurisan.</p>
      </main>
    )
  }

  if (session_id) {
    await fulfillCheckoutSession(session_id)
  }

  const surprise = await getSurpriseBySlug(slug)
  if (!surprise) {
    redirect('/create')
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-16">
      <div className="mb-10 text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="mt-4 font-serif text-3xl font-bold">Iznenađenje je spremno!</h1>
        <p className="mt-2 text-zinc-400">
          Pošalji link osobi —{' '}
          <span className="text-pink-300">{surprise.payload.recipientName}</span> će se
          iznenaditi.
        </p>
      </div>

      <SharePanel slug={slug} recipientName={surprise.payload.recipientName} />

      <div className="mt-12 text-center">
        <Link href="/create" className="text-sm text-zinc-500 hover:text-zinc-300">
          Napravi još jedno iznenađenje
        </Link>
      </div>
    </main>
  )
}
