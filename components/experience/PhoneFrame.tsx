'use client'

import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
  wallpaper?: string
  className?: string
  fullBleed?: boolean
}

export default function PhoneFrame({
  children,
  wallpaper,
  className = '',
  fullBleed = false,
}: PhoneFrameProps) {
  if (fullBleed) {
    return (
      <div
        className={`relative mx-auto h-full w-full max-w-lg overflow-hidden ${className}`}
        style={{ background: wallpaper ?? '#0a0a0a' }}
      >
        <div className="absolute top-2 left-1/2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black/80" />
        {children}
      </div>
    )
  }

  return (
    <div className={`mx-auto w-full max-w-[340px] ${className}`}>
      <div className="relative rounded-[2.75rem] border border-white/20 bg-zinc-950 p-[10px] shadow-2xl shadow-black/60">
        <div className="absolute top-4 left-1/2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
        <div
          className="relative overflow-hidden rounded-[2.25rem] bg-zinc-900"
          style={{
            minHeight: 'min(640px, 78dvh)',
            background: wallpaper ?? '#0a0a0a',
          }}
        >
          {children}
        </div>
        <div className="absolute bottom-3 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-white/25" />
      </div>
    </div>
  )
}
