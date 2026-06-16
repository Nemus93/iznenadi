import type { SurpriseData } from '@/lib/types/surprise'

export const demoData: SurpriseData = {
  recipientName: 'Ana',
  senderName: 'Marko',
  occasion: 'Srećan Rođendan',
  reasons: [
    'Tvoj osmeh me budi svakog jutra',
    'Uvek me nasmešiš kada mi je najteže',
    'Tvoja toplina čini da se osećam posebno',
    'Uvek si tu za mene, bez obzira na sve',
    'Jer si jednostavno — ti',
  ],
  photos: [
    '/demo-photos/photo1.jpg',
    '/demo-photos/photo2.jpg',
    '/demo-photos/photo3.jpg',
  ],
  mainMessage:
    'Draga Ana, svaki dan sa tobom je poseban. Tvoj smeh, tvoja toplina, tvoja dobrota — sve to čini moj svet lepšim. Hvala ti što si baš takva kakva jesi. Ovo je samo mali podsetnik koliko si važna za mene.',
  finaleText: 'Srećan Rođendan, moja ljubavi!',
  themeMode: 'preset',
  theme: 'rose',
  tier: 'standard',
}
