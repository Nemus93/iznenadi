import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CreateWizard from './CreateWizard'
import QuizWizard from './QuizWizard'
import PhoneWizard from './PhoneWizard'
import { getTemplate } from '@/lib/templates/registry'
import { TIERS, type Tier } from '@/lib/types/surprise'

export const metadata: Metadata = {
  title: 'Napravi iznenađenje — Iznenadi',
  description: 'Popuni podatke i kreiraj personalizovano iznenađenje.',
}

interface CreatePageProps {
  searchParams: Promise<{ template?: string; tier?: string; payment?: string }>
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const params = await searchParams
  const templateId = params.template ?? 'love_message'
  const tierRaw = params.tier ?? 'basic'

  const template = getTemplate(templateId)
  if (!template?.available) {
    redirect('/templates')
  }

  const tier = TIERS.includes(tierRaw as Tier) ? (tierRaw as Tier) : 'basic'
  const tierValid = template.tiers.some((t) => t.tier === tier)
  if (!tierValid) {
    redirect(`/templates`)
  }

  const paymentCancelled = params.payment === 'cancelled'

  if (template.id === 'secret_quiz') {
    return (
      <>
        {paymentCancelled && (
          <div className="mx-auto max-w-lg px-6 pt-6">
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Plaćanje je otkazano. Možeš nastaviti i pokušati ponovo.
            </p>
          </div>
        )}
        <QuizWizard templateName={template.name} />
      </>
    )
  }

  if (template.id === 'unlock_phone') {
    return (
      <>
        {paymentCancelled && (
          <div className="mx-auto max-w-lg px-6 pt-6">
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Plaćanje je otkazano. Možeš nastaviti i pokušati ponovo.
            </p>
          </div>
        )}
        <PhoneWizard templateName={template.name} />
      </>
    )
  }

  return (
    <>
      {paymentCancelled && (
        <div className="mx-auto max-w-lg px-6 pt-6">
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Plaćanje je otkazano. Možeš nastaviti i pokušati ponovo.
          </p>
        </div>
      )}
      <CreateWizard templateId={template.id} tier={tier} templateName={template.name} />
    </>
  )
}
