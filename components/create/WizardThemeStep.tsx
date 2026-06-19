'use client'

import type { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { STANDARD_THEMES, THEME_LABELS, THEME_PRESETS } from '@/lib/themes/presets'
import type { Theme } from '@/lib/types/surprise'

interface ThemeFormValues extends FieldValues {
  themeMode: 'preset' | 'custom'
  theme: Theme
  customColors?: { primary: string; accent: string; background: string }
}

interface WizardThemeStepProps<T extends ThemeFormValues> {
  form: UseFormReturn<T>
  values: T
  allowCustomColors?: boolean
  themes?: Theme[]
  defaultCustomColors?: { primary: string; accent: string; background: string }
}

export default function WizardThemeStep<T extends ThemeFormValues>({
  form,
  values,
  allowCustomColors = true,
  themes = STANDARD_THEMES,
  defaultCustomColors = { primary: '#db2777', accent: '#f472b6', background: '#3d0a1f' },
}: WizardThemeStepProps<T>) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-white">Izgled</h2>
        <p className="mt-1 text-sm text-zinc-400">Izaberi boje za iskustvo.</p>
      </div>

      {allowCustomColors && (
        <div className="flex rounded-xl border border-zinc-800 p-1">
          <button
            type="button"
            onClick={() => form.setValue('themeMode' as Path<T>, 'preset' as T[Path<T>])}
            className={`flex-1 rounded-lg py-2 text-sm transition ${
              values.themeMode === 'preset' ? 'bg-pink-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Preset boje
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue('themeMode' as Path<T>, 'custom' as T[Path<T>])
              if (!values.customColors) {
                form.setValue('customColors' as Path<T>, defaultCustomColors as T[Path<T>])
              }
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
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => form.setValue('theme' as Path<T>, theme as T[Path<T>])}
              className={`rounded-2xl border p-3 text-left transition ${
                values.theme === theme
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div
                className="mb-2 h-8 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${THEME_PRESETS[theme].bgStart}, ${THEME_PRESETS[theme].bgEnd})`,
                }}
              />
              <p className="text-xs text-white">{THEME_LABELS[theme]}</p>
            </button>
          ))}
        </div>
      )}

      {values.themeMode === 'custom' && allowCustomColors && (
        <div className="space-y-4">
          {(['primary', 'accent', 'background'] as const).map((key) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm text-zinc-400 capitalize">{key}</span>
              <input
                type="color"
                value={values.customColors?.[key] ?? defaultCustomColors[key]}
                onChange={(e) =>
                  form.setValue('customColors' as Path<T>, {
                    ...defaultCustomColors,
                    ...values.customColors,
                    [key]: e.target.value,
                  } as T[Path<T>])
                }
                className="h-12 w-full cursor-pointer rounded-xl border border-zinc-800 bg-transparent"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
