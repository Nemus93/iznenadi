import type { Metadata } from 'next'
import LoveMessage from '@/components/templates/LoveMessage'
import { demoData } from '@/lib/demo-data'

export const metadata: Metadata = {
  title: 'Demo — Iznenadi',
  description: 'Primer personalizovanog iznenađenja',
}

export default function DemoPage() {
  return <LoveMessage data={demoData} />
}
