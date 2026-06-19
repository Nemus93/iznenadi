'use client'

export function playNotificationChime() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    // ignore
  }
}

export function vibrateNotification() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([12, 40, 12])
  }
}

export function feedbackOnNotification() {
  playNotificationChime()
  vibrateNotification()
}
