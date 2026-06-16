import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
      <h1 className="font-serif text-4xl font-bold">404</h1>
      <p className="mt-4 text-zinc-400">Ovo iznenađenje ne postoji ili je uklonjeno.</p>
      <Link href="/" className="mt-8 text-pink-400 hover:text-pink-300">
        ← Nazad na početnu
      </Link>
    </main>
  )
}
