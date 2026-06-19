'use client'

import Link from 'next/link'

interface WizardShellProps {
  steps: readonly string[]
  currentStep: number
  templateName: string
  children: React.ReactNode
  onBack: () => void
  onNext: () => void
  isLastStep: boolean
  isSubmitting?: boolean
  submitLabel?: string
  nextLabel?: string
  showPreview?: boolean
  onPreview?: () => void
}

export default function WizardShell({
  steps,
  currentStep,
  templateName,
  children,
  onBack,
  onNext,
  isLastStep,
  isSubmitting = false,
  submitLabel = 'Objavi iznenađenje',
  nextLabel = 'Dalje',
  showPreview = false,
  onPreview,
}: WizardShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10">
      <header className="mb-8">
        <Link href="/templates" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Nazad na template-e
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-bold text-white">{templateName}</h1>
        <div className="mt-6 flex gap-1">
          {steps.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1 rounded-full transition ${
                  i <= currentStep ? 'bg-pink-500' : 'bg-zinc-800'
                }`}
              />
              <p
                className={`mt-1 truncate text-[10px] ${
                  i === currentStep ? 'text-pink-400' : 'text-zinc-600'
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6">
        {showPreview && onPreview && (
          <button
            type="button"
            onClick={onPreview}
            className="w-full rounded-full border border-zinc-700 py-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Pregledaj iskustvo
          </button>
        )}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 rounded-full border border-zinc-700 py-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
            >
              Nazad
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-pink-500 py-3 text-sm font-medium text-white transition hover:bg-pink-400 disabled:opacity-50"
          >
            {isSubmitting ? 'Objavljujem...' : isLastStep ? submitLabel : nextLabel}
          </button>
        </div>
      </footer>
    </main>
  )
}
