'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import ExperiencePreviewModal from '@/components/experience/ExperiencePreviewModal'
import {
  createFormSchema,
  defaultCreateFormValues,
  formValuesToPayload,
  type CreateFormValues,
  type Theme,
  type Tier,
} from '@/lib/types/surprise'
import {
  getMaxPhotos,
  TIER_LABELS,
  tierSupportsCustomColors,
  type TemplateId,
} from '@/lib/templates/registry'
import { BASIC_THEMES, STANDARD_THEMES, THEME_LABELS, THEME_PRESETS } from '@/lib/themes/presets'
import { handleCreateSurpriseResult } from '@/lib/handle-create-result'
import WizardThemeStep from '@/components/create/WizardThemeStep'
import { createSurpriseAction } from './actions'
import {
  compressImage,
  getTotalFileSize,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/lib/compress-image'

const STEPS = ['Ko', 'Razlozi', 'Slike', 'Poruka', 'Izgled', 'Pregled'] as const

const OCCASION_PRESETS = [
  { label: 'Godišnjica', value: 'Srećna godišnjica' },
  { label: 'Valentinovo', value: 'Srećno Valentinovo' },
  { label: 'Izvinjenje', value: 'Oprosti mi...' },
  { label: 'Samo tako', value: 'Samo htedoh da te iznenadim' },
]

const DEFAULT_CUSTOM_COLORS = {
  primary: '#db2777',
  accent: '#f472b6',
  background: '#3d0a1f',
}

interface CreateWizardProps {
  templateId: TemplateId
  tier: Tier
  templateName: string
}

export default function CreateWizard({ templateId, tier, templateName }: CreateWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const maxPhotos = getMaxPhotos(tier)
  const availableThemes = tier === 'basic' ? BASIC_THEMES : STANDARD_THEMES
  const allowCustomColors = tierSupportsCustomColors(tier)

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: defaultCreateFormValues,
    mode: 'onTouched',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'reasons',
  })

  const values = form.watch()

  async function goNext() {
    setSubmitError(null)
    if (step === 0) {
      const valid = await form.trigger(['recipientName', 'senderName', 'occasion'])
      if (!valid) return
    }
    if (step === 1) {
      const valid = await form.trigger(
        fields.map((_, i) => `reasons.${i}.value` as `reasons.${number}.value`)
      )
      if (!valid) return
    }
    if (step === 2 && photos.length === 0) {
      setSubmitError('Dodaj bar jednu sliku.')
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
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setSubmitError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, maxPhotos)
    photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    setPhotos(selected)
    setPhotoPreviews(selected.map((f) => URL.createObjectURL(f)))
    setSubmitError(null)
  }

  function applyOccasionPreset(value: string) {
    form.setValue('occasion', value, { shouldValidate: true })
  }

  function buildPreviewPayload(): ReturnType<typeof formValuesToPayload> {
    return formValuesToPayload(
      values,
      photoPreviews.length > 0 ? photoPreviews : ['https://placehold.co/400x600/3d0a1f/ffffff?text=Slika'],
      tier
    )
  }

  async function onSubmit(data: CreateFormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      setSubmitStatus('Kompresija slika...')
      const compressed = await Promise.all(photos.map(compressImage))
      setSubmitStatus('Objavljujem...')
      const totalSize = getTotalFileSize(compressed)

      if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
        setSubmitError('Slike su prevelike. Probaj manje slike ili samo 1–2.')
        return
      }

      const formData = new FormData()
      formData.set('payload', JSON.stringify(data))
      formData.set('template', templateId)
      formData.set('tier', tier)
      for (const photo of compressed) {
        formData.append('photos', photo)
      }

      const result = await createSurpriseAction(formData)
      handleCreateSurpriseResult(result, router, setSubmitError)
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('Body exceeded')
          ? 'Slike su prevelike. Probaj manje slike ili samo 1–2.'
          : 'Nešto nije u redu. Proveri internet konekciju i Supabase podešavanja.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
      setSubmitStatus(null)
    }
  }

  const themeLabel =
    values.themeMode === 'custom'
      ? 'Tvoja kombinacija'
      : THEME_LABELS[values.theme]

  return (
    <>
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10">
        <header className="mb-8">
          <Link href="/templates" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Promeni template
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold">Napravi iznenađenje</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {templateName} · {TIER_LABELS[tier]} · korak {step + 1} od {STEPS.length}:{' '}
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

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-6"
        >
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Ime primaoca" error={form.formState.errors.recipientName?.message}>
                <input
                  {...form.register('recipientName')}
                  placeholder="npr. Ana"
                  className={inputClass}
                />
              </Field>
              <Field label="Tvoje ime" error={form.formState.errors.senderName?.message}>
                <input
                  {...form.register('senderName')}
                  placeholder="npr. Marko"
                  className={inputClass}
                />
              </Field>
              <Field label="Povod" error={form.formState.errors.occasion?.message}>
                <input
                  {...form.register('occasion')}
                  placeholder="npr. Srećan rođendan"
                  className={inputClass}
                />
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
              <p className="text-sm text-zinc-400">
                Napiši 3–5 razloga zašto je ta osoba posebna.
              </p>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...form.register(`reasons.${index}.value`)}
                    placeholder={`Razlog ${index + 1}`}
                    className={`${inputClass} flex-1`}
                  />
                  {fields.length > 3 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-lg px-3 text-zinc-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {form.formState.errors.reasons?.message && (
                <p className="text-sm text-red-400">{form.formState.errors.reasons.message}</p>
              )}
              {fields.length < 5 && (
                <button
                  type="button"
                  onClick={() => append({ value: '' })}
                  className="text-sm text-pink-400 hover:text-pink-300"
                >
                  + Dodaj razlog
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Dodaj 1–{maxPhotos} slika (max 5 MB svaka).
                {tier === 'standard' && ' Standard nivo podržava lightbox uvećanje.'}
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handlePhotoChange}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-pink-400"
              />
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="aspect-square rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Glavna poruka" error={form.formState.errors.mainMessage?.message}>
                <textarea
                  {...form.register('mainMessage')}
                  rows={6}
                  placeholder="Tvoja lična poruka..."
                  className={inputClass}
                />
              </Field>
              <Field label="Završni tekst (finale)" error={form.formState.errors.finaleText?.message}>
                <input
                  {...form.register('finaleText')}
                  placeholder="npr. Srećan rođendan, moja ljubavi!"
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
              themes={availableThemes}
              defaultCustomColors={DEFAULT_CUSTOM_COLORS}
            />
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm">
                <Row label="Template" value={templateName} />
                <Row label="Nivo" value={TIER_LABELS[tier]} />
                <Row label="Primalac" value={values.recipientName} />
                <Row label="Od" value={values.senderName} />
                <Row label="Povod" value={values.occasion} />
                <Row
                  label="Razlozi"
                  value={`${values.reasons.filter((r) => r.value).length} uneto`}
                />
                <Row label="Slike" value={`${photos.length} izabrano`} />
                <Row label="Izgled" value={themeLabel} />
                <p className="border-t border-zinc-800 pt-4 text-zinc-400 italic">
                  &ldquo;{values.mainMessage.slice(0, 120)}
                  {values.mainMessage.length > 120 ? '...' : ''}&rdquo;
                </p>
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
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 rounded-full bg-pink-500 py-3 text-sm font-medium text-white hover:bg-pink-400"
              >
                Dalje
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-full bg-pink-500 py-3 text-sm font-medium text-white hover:bg-pink-400 disabled:opacity-50"
              >
                {isSubmitting ? (submitStatus ?? 'Objavljujem...') : 'Objavi iznenađenje'}
              </button>
            )}
          </div>
        </form>
      </div>

      <ExperiencePreviewModal
        data={buildPreviewPayload()}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  )
}

const inputClass =
  'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-pink-500 focus:outline-none'

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
    <div>
      <label className="mb-1.5 block text-sm text-zinc-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  )
}

function ThemePresetCard({
  theme,
  selected,
  onSelect,
}: {
  theme: Theme
  selected: boolean
  onSelect: () => void
}) {
  const colors = THEME_PRESETS[theme]

  return (
    <label
      className={`cursor-pointer rounded-2xl border p-3 text-center transition ${
        selected ? 'border-pink-500 bg-pink-500/10' : 'border-zinc-700 hover:border-zinc-500'
      }`}
    >
      <input type="radio" checked={selected} onChange={onSelect} className="sr-only" />
      <div
        className="mx-auto mb-2 h-10 w-10 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.bgStart}, ${colors.bgEnd})`,
        }}
      />
      <span className="text-xs">{THEME_LABELS[theme]}</span>
    </label>
  )
}

function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-zinc-500">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
        />
      </div>
    </div>
  )
}

function ThemePreviewSwatch({
  primary,
  accent,
  background,
}: {
  primary: string
  accent: string
  background: string
}) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{
        background: `linear-gradient(160deg, ${background}, ${primary})`,
      }}
    >
      <p style={{ color: accent }} className="text-sm">
        Pregled tvoje kombinacije
      </p>
      <p className="mt-1 font-serif text-lg text-white">♥ Ana</p>
    </div>
  )
}
