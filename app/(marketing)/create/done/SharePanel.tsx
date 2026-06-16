'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getSurpriseUrl } from '@/lib/slug'

interface SharePanelProps {
  slug: string
  recipientName: string
}

export default function SharePanel({ slug, recipientName }: SharePanelProps) {
  const [copied, setCopied] = useState(false)
  const url = getSurpriseUrl(slug)
  const whatsappText = encodeURIComponent(
    `${recipientName}, imam iznenađenje za tebe! Otvori ovaj link: ${url}`
  )
  const smsText = encodeURIComponent(`Imaš iznenađenje! Otvori: ${url}`)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Tvoj link</p>
        <p className="break-all font-mono text-sm text-pink-300">{url}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={copyLink}
          className="flex-1 rounded-full bg-pink-500 py-3 text-sm font-medium text-white hover:bg-pink-400"
        >
          {copied ? 'Kopirano!' : 'Kopiraj link'}
        </button>
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-green-600 py-3 text-center text-sm text-green-400 hover:bg-green-600/10"
        >
          WhatsApp
        </a>
        <a
          href={`sms:?body=${smsText}`}
          className="flex-1 rounded-full border border-zinc-600 py-3 text-center text-sm text-zinc-300 hover:bg-zinc-800"
        >
          SMS
        </a>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-white p-6">
        <QRCodeSVG value={url} size={160} />
        <p className="text-xs text-zinc-500">Skeniraj QR kod da otvoriš iznenađenje</p>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-pink-400 hover:text-pink-300"
      >
        Pogledaj kako izgleda →
      </a>
    </div>
  )
}
