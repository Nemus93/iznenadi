'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import ExperiencePreviewModal from '@/components/experience/ExperiencePreviewModal'
import WizardThemeStep from '@/components/create/WizardThemeStep'
import {
  countdownCreateFormSchema,
  countdownFormToPayload,
  defaultCountdownFormValues,
  type CountdownCreateFormValues,
} from '@/lib/types/countdown'
import { TIER_LABELS, tierSupportsCustomColors } from '@/lib/templates/registry'
import { THEME_LABELS } from '@/lib/themes/presets'
import { handleCreateSurpriseResult } from '@/lib/handle-create-result'
import { createSurpriseAction } from './actions'
import {
  compressImage,
  getTotalFileSize,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/lib/compress-image'

const STEPS = ['Ko', 'Datum', 'Slike', 'Poruka', 'Izgled', 'Pregled'] as const
const MAX_PHOTOS = 5

const OCCASION_PRESETS = [
  { label: 'Godišnjica', value: 'Srećna godišnjica' },
  { label: 'Valentinovo', value: 'Srećno Valentinovo' },
  { label: 'Rođendan', value: 'Srećan rođendan' },
  { label: 'Samo tako', value: 'Samo htedoh da te iznenadim' },
]

const DEFAULT_CUSTOM_COLORS = {
  primary: '#db2777',
  accent: '#f472b6',
  background: '#3d0a1f',
}

interface CountdownWizardProps {
  templateName: string
}

function defaultTargetLocal(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(20, 0, 0, 0)
  return d.toISOString().slice(0, 16)
}

export default function CountdownWizard({ templateName }: CountdownWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const form = useForm<CountdownCreateFormValues>({
    resolver: zodResolver(countdownCreateFormSchema),
    defaultValues: { ...defaultCountdownFormValues, targetAt: defaultTargetLocal() },
    mode: 'onTouched',
  })

  const values = form.watch()
  const allowCustomColors = tierSupportsCustomColors('standard')

  async function goNext() {
    setSubmitError(null)
    if (step === 0) {
      const valid = await form.trigger(['recipientName', 'senderName', 'occasion'])
      if (!valid) return
    }
    if (step === 1) {
      const valid = await form.trigger(['targetAt', 'teaserMessage'])
      if (!valid) return
    }
    if (step === 2 && photos.length > MAX_PHOTOS) {
      setSubmitError(`Maksimalno ${MAX_PHOTOS} slika.`)
      return
    }
    if (step === 3) {
      const valid = await form.trigger(['mainMessage', 'finaleText'])
      if (!valid) return
    }
    if (step === 4) {
      const valid = await form.trigger(['themeMode', 'theme', 'customColors'])
      if (!valid) return
    }
    if (step === STEPS.length - 1) {
      await form.handleSubmit(onSubmit)()
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setSubmitError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS)
    photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    setPhotos(selected)
    setPhotoPreviews(selected.map((f) => URL.createObjectURL(f)))
    setSubmitError(null)
  }

  function applyOccasionPreset(value: string) {
    form.setValue('occasion', value, { shouldValidate: true })
  }

  function buildPreviewPayload() {
    return countdownFormToPayload(
      values,
      photoPreviews.length > 0
        ? photoPreviews
        : ['https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80'],
      'standard'
    )
  }

  async function onSubmit(data: CountdownCreateFormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const compressed = photos.length > 0 ? await Promise.all(photos.map(compressImage)) : []
      if (compressed.length > 0) {
        setSubmitStatus('Kompresija slika...')
        const totalSize = getTotalFileSize(compressed)
        if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
          setSubmitError('Slike su prevelike. Probaj manje slika.')
          return
        }
      }

      setSubmitStatus('Objavljujem...')
      const formData = new FormData()
      formData.set('payload', JSON.stringify(data))
      formData.set('template', 'countdown')
      formData.set('tier', 'standard')
      for (const photo of compressed) {
        formData.append('photos', photo)
      }

      const result = await createSurpriseAction(formData)
      handleCreateSurpriseResult(result, router, setSubmitError)
    } catch {
      setSubmitError('Nešto nije u redu. Proveri konekciju i Supabase podešavanja.')
    } finally {
      setIsSubmitting(false)
      setSubmitStatus(null)
    }
  }

  const themeLabel =
    values.themeMode === 'custom' ? 'Tvoja kombinacija' : THEME_LABELS[values.theme]

  const inputClass =
    'w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-pink-500 focus:outline-none'

  return (
    <>
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10">
        <header className="mb-8">
          <Link href="/templates" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Promeni template
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold">Napravi odbrojavanje</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {templateName} · {TIER_LABELS.standard} · korak {step + 1} od {STEPS.length}:{' '}
            {STEPS[step]}
          </p>
          <div className="mt-4 flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition ${
                  i <= step ? 'bg-pink-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Ime primaoca" error={form.formState.errors.recipientName?.message}>
                <input {...form.register('recipientName')} placeholder="npr. Ana" className={inputClass} />
              </Field>
              <Field label="Tvoje ime" error={form.formState.errors.senderName?.message}>
                <input {...form.register('senderName')} placeholder="npr. Marko" className={inputClass} />
              </Field>
              <Field label="Povod" error={form.formState.errors.occasion?.message}>
                <input {...form.register('occasion')} placeholder="npr. Srećna godišnjica" className={inputClass} />
                <div className="mt-2 flex flex-wrap gap-2">
                  {OCCASION_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyOccasionPreset(preset.value)}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-pink-500/50 hover:text-pink-300"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Datum i vreme otključavanja" error={form.formState.errors.targetAt?.message}>
                <input
                  type="datetime-local"
                  {...form.register('targetAt')}
                  className={inputClass}
                />
              </Field>
              <Field label="Teaser poruka (pre odbrojavanja)" error={form.formState.errors.teaserMessage?.message}>
                <input
                  {...form.register('teaserMessage')}
                  placeholder="Nešto posebno te čeka..."
                  className={inputClass}
                />
              </Field>
              <p className="text-xs text-zinc-500">
                Primalac vidi odbrojavanje do ovog momenta, pa tek onda poruku.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Slike su opcione (do {MAX_PHOTOS}). Možeš preskočiti ako ne želiš galeriju.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handlePhotoChange}
                className="w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:text-sm file:text-white"
              />
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="" className="aspect-square rounded-xl object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Glavna poruka (posle odbrojavanja)" error={form.formState.errors.mainMessage?.message}>
                <textarea
                  {...form.register('mainMessage')}
                  rows={6}
                  placeholder="Poruka koja se otkriva kad istekne vreme..."
                  className={inputClass}
                />
              </Field>
              <Field label="Završni tekst (finale)" error={form.formState.errors.finaleText?.message}>
                <input
                  {...form.register('finaleText')}
                  placeholder="npr. Volim te!"
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <WizardThemeStep
              form={form}
              values={values}
              allowCustomColors={allowCustomColors}
              defaultCustomColors={DEFAULT_CUSTOM_COLORS}
            />
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm">
                <Row label="Template" value={templateName} />
                <Row label="Primalac" value={values.recipientName} />
                <Row label="Datum" value={values.targetAt ? new Date(values.targetAt).toLocaleString('sr-RS') : '—'} />
                <Row label="Slike" value={photos.length > 0 ? `${photos.length} izabrano` : 'Bez slika'} />
                <Row label="Izgled" value={themeLabel} />
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full rounded-full border border-zinc-700 py-3 text-sm text-zinc-300 hover:border-pink-500/50 hover:text-pink-300"
              >
                Pregledaj iskustvo pre objave
              </button>
            </div>
          )}

          {submitError && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{submitError}</p>
          )}
          {submitStatus && <p className="text-center text-sm text-zinc-500">{submitStatus}</p>}

          <div className="mt-auto flex gap-3 pt-4">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                disabled={isSubmitting}
                className="flex-1 rounded-full border border-zinc-700 py-3 text-sm text-zinc-300 hover:border-zinc-500"
              >
                Nazad
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-pink-500 py-3 text-sm font-medium text-white hover:bg-pink-400 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Objavljujem...'
                : step === STEPS.length - 1
                  ? 'Objavi iznenađenje'
                  : 'Dalje'}
            </button>
          </div>
        </form>
      </div>

      {showPreview && (
        <ExperiencePreviewModal
          template="countdown"
          data={buildPreviewPayload()}
          open={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-zinc-400">{label}</span>
      {children}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-800 py-2 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  )
}
