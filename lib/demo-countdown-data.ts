import type { CountdownPayload } from '@/lib/types/countdown'

export const demoCountdownData: CountdownPayload = {
  recipientName: 'Ana',
  senderName: 'Marko',
  occasion: 'Srećna godišnjica',
  targetAt: new Date(Date.now() + 25_000).toISOString(),
  teaserMessage: 'Još malo pa otkrivam sve...',
  photos: [
    '/demo-photos/photo1.jpg',
    '/demo-photos/photo2.jpg',
    '/demo-photos/photo3.jpg',
  ],
  mainMessage:
    'Draga Ana, čekao sam ovaj trenutak da ti kažem koliko značiš. Svaki dan sa tobom je dar — i ovo je samo mali podsetnik.',
  finaleText: 'Srećna godišnjica, moja ljubavi!',
  themeMode: 'preset',
  theme: 'rose',
  tier: 'standard',
}
