import type { Metadata } from 'next'
import DemoCountdownClient from './DemoCountdownClient'

export const metadata: Metadata = {
  title: 'Demo odbrojavanje — Iznenadi',
  description: 'Primer odbrojavanja do posebne poruke',
}

export default function DemoCountdownPage() {
  return <DemoCountdownClient />
}
