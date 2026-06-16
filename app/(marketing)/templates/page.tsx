import type { Metadata } from 'next'
import Link from 'next/link'
import { TEMPLATES, TIER_LABELS } from '@/lib/templates/registry'

export const metadata: Metadata = {
  title: 'Izaberi iznenađenje — Iznenadi',
  description: 'Pogledaj template-e i izaberi nivo pre nego što popuniš podatke.',
}

export default function TemplatesPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-16">
      <header className="mb-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Nazad
        </Link>
        <h1 className="mt-4 font-serif text-4xl font-bold text-white sm:text-5xl">
          Izaberi iznenađenje
        </h1>
        <p className="mt-3 max-w-xl text-lg text-zinc-400">
          Pogledaj demo, uporedi nivoe, pa popuni podatke za izabrani tip.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {TEMPLATES.map((template) => (
          <article
            key={template.id}
            className={`rounded-3xl border p-6 sm:p-8 ${
              template.available
                ? 'border-zinc-800 bg-zinc-900/50'
                : 'border-zinc-800/50 bg-zinc-900/20 opacity-70'
            }`}
          >
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <span className="text-4xl">{template.emoji}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-serif text-2xl font-bold text-white">{template.name}</h2>
                  {!template.available && (
                    <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs text-zinc-400">
                      Uskoro
                    </span>
                  )}
                </div>
                <p className="mt-2 text-zinc-400">{template.description}</p>
              </div>
              {template.available && (
                <Link
                  href={template.demoPath}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  Pogledaj demo
                </Link>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {template.tiers.map((tierOption) => (
                <div
                  key={tierOption.tier}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="font-medium text-white">{tierOption.label}</span>
                    <span className="text-xs text-pink-400">{tierOption.priceLabel}</span>
                  </div>
                  <p className="mb-4 text-xs tracking-wider text-zinc-500 uppercase">
                    {TIER_LABELS[tierOption.tier]}
                  </p>
                  <ul className="mb-5 space-y-2">
                    {tierOption.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm text-zinc-400">
                        <span className="text-pink-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {template.available ? (
                    <Link
                      href={`/create?template=${template.id}&tier=${tierOption.tier}`}
                      className="block rounded-full bg-pink-500 py-2.5 text-center text-sm font-medium text-white transition hover:bg-pink-400"
                    >
                      Napravi — {tierOption.label}
                    </Link>
                  ) : (
                    <span className="block rounded-full bg-zinc-800 py-2.5 text-center text-sm text-zinc-500">
                      Uskoro dostupno
                    </span>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
