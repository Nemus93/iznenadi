'use client'

import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
  wallpaper?: string
  className?: string
}

export default function PhoneFrame({ children, wallpaper, className = '' }: PhoneFrameProps) {
  return (
    <div className={`mx-auto w-full max-w-[340px] ${className}`}>
      <div className="relative rounded-[2.5rem] border border-white/15 bg-black p-2 shadow-2xl shadow-black/50">
        <div className="absolute top-3 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div
          className="relative overflow-hidden rounded-[2rem] bg-zinc-900"
          style={{
            minHeight: 'min(640px, 78dvh)',
            background: wallpaper ?? '#0a0a0a',
          }}
        >
          {children}
        </div>
        <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-white/20" />
      </div>
    </div>
  )
}
