import Link from 'next/link'

const steps = [
  {
    title: 'Popuni',
    description: 'Unesi ime, poruke, razloge i slike — sve što želiš da osoba vidi.',
  },
  {
    title: 'Dobij link',
    description: 'Odmah dobijaš personalizovan link spreman za deljenje.',
  },
  {
    title: 'Pošalji',
    description:
      'Pošalji link ili zakazi prave SMS notifikacije na telefon primaoca — misteriozno i personalizovano.',
  },
]

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-16">
      <header className="mb-16 flex items-center justify-between">
        <span className="font-serif text-xl tracking-wide text-pink-300">iznenadi</span>
        <Link
          href="/demo"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Pogledaj demo →
        </Link>
      </header>

      <section className="mb-16 flex flex-1 flex-col justify-center gap-8">
        <p className="text-sm uppercase tracking-[0.25em] text-pink-400/80">
          Beta — besplatno
        </p>
        <h1 className="font-serif text-5xl font-bold leading-tight text-white sm:text-6xl">
          Iznenadi nekoga
          <br />
          <span className="text-pink-400">koga voliš</span>
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-zinc-400">
          Napravi personalizovano digitalno iznenađenje — animirana poruka sa
          slikama, razlozima i tvojim rečima. Jedan link, otvori na telefonu,
          ne zaboravi se.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/templates"
            className="rounded-full bg-pink-500 px-8 py-4 text-base font-medium text-white transition hover:bg-pink-400"
          >
            Izaberi iznenađenje
          </Link>
          <Link
            href="/demo"
            className="rounded-full border border-zinc-700 px-8 py-4 text-base text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Pogledaj primer
          </Link>
        </div>
      </section>

      <section className="mb-16 grid gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <span className="mb-3 inline-block font-serif text-3xl text-pink-500/60">
              {i + 1}
            </span>
            <h2 className="mb-2 font-medium text-white">{step.title}</h2>
            <p className="text-sm leading-relaxed text-zinc-400">{step.description}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-600">
        Iznenadi · personalizovana digitalna iznenađenja
      </footer>
    </main>
  )
}
