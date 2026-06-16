import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TemplateRouter from '@/components/templates/TemplateRouter'
import { getSurpriseBySlug } from '@/lib/surprises'
import { isSupabaseConfigured } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  if (!isSupabaseConfigured()) {
    return { title: 'Iznenadi' }
  }

  const surprise = await getSurpriseBySlug(slug)
  if (!surprise) {
    return { title: 'Nije pronađeno — Iznenadi' }
  }

  const { recipientName } = surprise.payload

  return {
    title: `${recipientName}, imaš iznenađenje!`,
    description: 'Neko ti je poslao posebno iznenađenje. Otvori link da vidiš.',
    openGraph: {
      title: `${recipientName}, imaš iznenađenje!`,
      description: 'Tapni da otvoriš svoje iznenađenje.',
      type: 'website',
    },
  }
}

export default async function SurprisePage({ params }: PageProps) {
  const { slug } = await params

  if (!isSupabaseConfigured()) {
    notFound()
  }

  const surprise = await getSurpriseBySlug(slug)
  if (!surprise) {
    notFound()
  }

  return <TemplateRouter template={surprise.template} data={surprise.payload} />
}
