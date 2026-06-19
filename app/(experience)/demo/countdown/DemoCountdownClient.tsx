'use client'

import { useMemo } from 'react'
import CountdownTemplate from '@/components/templates/Countdown'
import { demoCountdownData } from '@/lib/demo-countdown-data'

export default function DemoCountdownClient() {
  const data = useMemo(
    () => ({
      ...demoCountdownData,
      targetAt: new Date(Date.now() + 20_000).toISOString(),
    }),
    []
  )

  return <CountdownTemplate data={data} />
}
