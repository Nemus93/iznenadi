'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitCustomRequestAction } from '../custom-actions'

const inputClass =
  'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-pink-500 focus:outline-none'

export default function CustomRequestForm() {
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await submitCustomRequestAction(formData)
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-white">Hvala!</h1>
        <p className="mt-4 text-zinc-400">
          Primili smo tvoj zahtev. Javićemo ti se na email sa procenom cene i rokom.
        </p>
        <Link
          href="/templates"
          className="mt-8 inline-block rounded-full bg-pink-500 px-6 py-3 text-sm text-white"
        >
          Nazad na katalog
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link href="/templates" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Katalog
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-bold text-white">Nešto posebno?</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Opiši šta želiš — proverićemo da li možemo da napravimo i poslati procenu.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Ime">
          <input name="name" required className={inputClass} placeholder="Tvoje ime" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} placeholder="email@..." />
        </Field>
        <Field label="Šta želiš da napravimo?">
          <textarea
            name="description"
            required
            rows={6}
            className={inputClass}
            placeholder="Opiši ideju, ton, za koga je, šta primalac treba da doživi..."
          />
        </Field>
        <Field label="Povod (opciono)">
          <input name="occasion" className={inputClass} placeholder="Godišnjica, rođendan..." />
        </Field>
        <Field label="Budžet (opciono)">
          <input name="budget" className={inputClass} placeholder="npr. do 5000 RSD" />
        </Field>
        <Field label="Rok (opciono)">
          <input name="deadline" className={inputClass} placeholder="npr. do 15. februara" />
        </Field>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-pink-500 py-3 text-sm font-medium text-white hover:bg-pink-400 disabled:opacity-50"
        >
          {loading ? 'Šaljem...' : 'Pošalji zahtev'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-zinc-400">{label}</label>
      {children}
    </div>
  )
}
