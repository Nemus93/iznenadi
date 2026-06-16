'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import ExperiencePreviewModal from '@/components/experience/ExperiencePreviewModal'
import {
  defaultPhoneCreateFormValues,
  phoneCreateFormSchema,
  phoneFormValuesToPayload,
  type PhoneCreateFormValues,
} from '@/lib/types/unlock-phone'
import type { Theme } from '@/lib/types/surprise'
import { TIER_LABELS, tierSupportsCustomColors } from '@/lib/templates/registry'
import { STANDARD_THEMES, THEME_LABELS, THEME_PRESETS } from '@/lib/themes/presets'
import { handleCreateSurpriseResult } from '@/lib/handle-create-result'
import { createSurpriseAction } from './actions'
import {
  compressImage,
  getTotalFileSize,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/lib/compress-image'

const STEPS = ['Ko', 'Notifikacije', 'Slike', 'Poruka', 'Izgled', 'Pregled'] as const
const MAX_PHOTOS = 5

const OCCASION_PRESETS = [
  { label: 'Godišnjica', value: 'Srećna godišnjica' },
  { label: 'Valentinovo', value: 'Srećno Valentinovo' },
  { label: 'Izvinjenje', value: 'Oprosti mi...' },
  { label: 'Samo tako', value: 'Samo htedoh da te iznenadim' },
]

const DEFAULT_CUSTOM_COLORS = {
  primary: '#7c3aed',
  accent: '#c084fc',
  background: '#2d0a4e',
}

interface PhoneWizardProps {
  templateName: string
}

export default function PhoneWizard({ templateName }: PhoneWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const form = useForm<PhoneCreateFormValues>({
    resolver: zodResolver(phoneCreateFormSchema),
    defaultValues: defaultPhoneCreateFormValues,
    mode: 'onTouched',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'notifications',
  })

  const values = form.watch()
  const allowCustomColors = tierSupportsCustomColors('premium')

  async function goNext() {
    setSubmitError(null)
    if (step === 0) {
      const valid = await form.trigger(['recipientName', 'senderName', 'occasion'])
      if (!valid) return
    }
    if (step === 1) {
      const valid = await form.trigger(
        fields.flatMap((_, i) => [
          `notifications.${i}.title` as const,
          `notifications.${i}.body` as const,
        ])
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
    const selected = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS)
    photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    setPhotos(selected)
    setPhotoPreviews(selected.map((f) => URL.createObjectURL(f)))
    setSubmitError(null)
  }

  function applyOccasionPreset(value: string) {
    form.setValue('occasion', value, { shouldValidate: true })
  }

  function setNotificationPhoto(index: number, photoIndex: number | undefined) {
    form.setValue(
      `notifications.${index}`,
      {
        ...values.notifications[index],
        photoIndex,
      },
      { shouldValidate: true }
    )
  }

  function buildPreviewPayload() {
    return phoneFormValuesToPayload(
      values,
      photoPreviews.length > 0
        ? photoPreviews
        : ['https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80']
    )
  }

  async function onSubmit(data: PhoneCreateFormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      setSubmitStatus('Kompresija slika...')
      const compressed = await Promise.all(photos.map(compressImage))
      setSubmitStatus('Objavljujem...')
      const totalSize = getTotalFileSize(compressed)

      if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
        setSubmitError('Slike su prevelike. Probaj manje slika.')
        return
      }

      const formData = new FormData()
      formData.set('payload', JSON.stringify(data))
      formData.set('template', 'unlock_phone')
      formData.set('tier', 'premium')
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

  return (
    <>
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10">
        <header className="mb-8">
          <Link href="/templates" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Promeni template
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold">Napravi otključaj telefon</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {templateName} · {TIER_LABELS.premium} · korak {step + 1} od {STEPS.length}:{' '}
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
            <div className="space-y-5">
              <p className="text-sm text-zinc-400">
                Postavi 3–5 notifikacija. Primalac otvara jednu po jednu na zaključanom telefonu.
                Posledna može biti hint za otključavanje.
              </p>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-wider text-zinc-500 uppercase">
                      Notifikacija {index + 1}
                    </span>
                    {fields.length > 3 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-xs text-zinc-500 hover:text-red-400"
                      >
                        Ukloni
                      </button>
                    )}
                  </div>
                  <input
                    {...form.register(`notifications.${index}.title`)}
                    placeholder="Naslov (npr. Marko 💕 ili Nepoznat broj)"
                    className={inputClass}
                  />
                  {form.formState.errors.notifications?.[index]?.title && (
                    <p className="text-sm text-red-400">
                      {form.formState.errors.notifications[index]?.title?.message}
                    </p>
                  )}
                  <textarea
                    {...form.register(`notifications.${index}.body`)}
                    rows={3}
                    placeholder="Tekst notifikacije..."
                    className={inputClass}
                  />
                  {form.formState.errors.notifications?.[index]?.body && (
                    <p className="text-sm text-red-400">
                      {form.formState.errors.notifications[index]?.body?.message}
                    </p>
                  )}
                </div>
              ))}
              {fields.length < 5 && (
                <button
                  type="button"
                  onClick={() => append({ title: '', body: '' })}
                  className="text-sm text-pink-400 hover:text-pink-300"
                >
                  + Dodaj notifikaciju
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Dodaj 1–{MAX_PHOTOS} slika (max 5 MB). Opciono poveži sliku sa notifikacijom.
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
                    <img key={src} src={src} alt={`Preview ${i + 1}`} className="aspect-square rounded-xl object-cover" />
                  ))}
                </div>
              )}
              {photoPreviews.length > 0 && fields.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-sm text-zinc-400">Slika u notifikaciji (opciono)</p>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-300 truncate">
                        {values.notifications[index]?.title || `Notifikacija ${index + 1}`}
                      </span>
                      <select
                        value={values.notifications[index]?.photoIndex ?? ''}
                        onChange={(e) => {
                          const v = e.target.value
                          setNotificationPhoto(index, v === '' ? undefined : Number(v))
                        }}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-white"
                      >
                        <option value="">Bez slike</option>
                        {photoPreviews.map((_, i) => (
                          <option key={i} value={i}>Slika {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Poruka posle otključavanja" error={form.formState.errors.mainMessage?.message}>
                <textarea
                  {...form.register('mainMessage')}
                  rows={6}
                  placeholder="Glavna poruka koju vidi kad otključa telefon..."
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
            <div className="space-y-5">
              {allowCustomColors && (
                <div className="flex gap-2 rounded-xl border border-zinc-800 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('themeMode', 'preset')
                      form.setValue('customColors', undefined)
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm transition ${
                      values.themeMode === 'preset' ? 'bg-pink-500 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Preset boje
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('themeMode', 'custom')
                      form.setValue('customColors', DEFAULT_CUSTOM_COLORS)
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm transition ${
                      values.themeMode === 'custom' ? 'bg-pink-500 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tvoja kombinacija
                  </button>
                </div>
              )}
              {values.themeMode === 'preset' && (
                <div className="grid grid-cols-3 gap-3">
                  {STANDARD_THEMES.map((theme) => (
                    <ThemePresetCard
                      key={theme}
                      theme={theme}
                      selected={values.theme === theme}
                      onSelect={() => form.setValue('theme', theme)}
                    />
                  ))}
                </div>
              )}
              {values.themeMode === 'custom' && (
                <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <ColorPickerField
                    label="Primarna"
                    value={values.customColors?.primary ?? DEFAULT_CUSTOM_COLORS.primary}
                    onChange={(v) =>
                      form.setValue('customColors', {
                        ...(values.customColors ?? DEFAULT_CUSTOM_COLORS),
                        primary: v,
                      })
                    }
                  />
                  <ColorPickerField
                    label="Akcent"
                    value={values.customColors?.accent ?? DEFAULT_CUSTOM_COLORS.accent}
                    onChange={(v) =>
                      form.setValue('customColors', {
                        ...(values.customColors ?? DEFAULT_CUSTOM_COLORS),
                        accent: v,
                      })
                    }
                  />
                  <ColorPickerField
                    label="Pozadina"
                    value={values.customColors?.background ?? DEFAULT_CUSTOM_COLORS.background}
                    onChange={(v) =>
                      form.setValue('customColors', {
                        ...(values.customColors ?? DEFAULT_CUSTOM_COLORS),
                        background: v,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm">
                <Row label="Template" value={templateName} />
                <Row label="Nivo" value={TIER_LABELS.premium} />
                <Row label="Primalac" value={values.recipientName} />
                <Row
                  label="Notifikacije"
                  value={`${values.notifications.filter((n) => n.title).length} uneto`}
                />
                <Row label="Slike" value={`${photos.length} izabrano`} />
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
        template="unlock_phone"
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
        style={{ background: `linear-gradient(135deg, ${colors.bgStart}, ${colors.bgEnd})` }}
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
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
      />
    </div>
  )
}
