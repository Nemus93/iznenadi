import type { Metadata } from 'next'
import CustomRequestForm from './CustomRequestForm'

export const metadata: Metadata = {
  title: 'Custom zahtev — Iznenadi',
  description: 'Opiši ideju za personalizovano iznenađenje koje nije u ponudi.',
}

export default function CustomRequestPage() {
  return <CustomRequestForm />
}
