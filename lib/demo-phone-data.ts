import type { UnlockPhonePayload } from '@/lib/types/unlock-phone'

export const demoPhoneData: UnlockPhonePayload = {
  recipientName: 'Ana',
  senderName: 'Marko',
  occasion: 'Srećna godišnjica',
  notifications: [
    {
      title: 'Nepoznat broj',
      body: 'Hej, imaš nešto novo na telefonu... pogledaj kad stigneš.',
      photoIndex: 0,
    },
    {
      title: 'Marko 💕',
      body: 'Sećaš se našeg prvog poljubljenja? Bilo je magično.',
    },
    {
      title: 'Podsjetnik',
      body: 'Danas je poseban dan — neko te voli više nego juče.',
      photoIndex: 1,
    },
    {
      title: 'Sistem',
      body: 'Sve notifikacije otvorene. Swipe up da otključaš telefon.',
    },
  ],
  photos: [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd4a70?w=800&q=80',
  ],
  mainMessage:
    'Draga Ana, tvoj telefon je „hakovao" neko ko te voli. Svaka notifikacija je deo naše priče — i ovo je samo početak. Hvala ti što si moja.',
  finaleText: 'Volim te, zauvek!',
  themeMode: 'preset',
  theme: 'midnight',
  tier: 'premium',
}
