import { NextResponse } from 'next/server'
import { processPendingNotificationJobs } from '@/lib/notification-jobs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await processPendingNotificationJobs()
  return NextResponse.json({ ok: true, ...result })
}
