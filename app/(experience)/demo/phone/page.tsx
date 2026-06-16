import type { Metadata } from 'next'
import UnlockPhone from '@/components/templates/UnlockPhone'
import { demoPhoneData } from '@/lib/demo-phone-data'

export const metadata: Metadata = {
  title: 'Demo telefon — Iznenadi',
  description: 'Primer otključaj telefon iskustva — otvori notifikacije jedna po jedna.',
}

export default function DemoPhonePage() {
  return <UnlockPhone data={demoPhoneData} />
}
