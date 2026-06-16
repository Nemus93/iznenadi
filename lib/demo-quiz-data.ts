import type { SecretQuizPayload } from '@/lib/types/secret-quiz'

export const demoQuizData: SecretQuizPayload = {
  recipientName: 'Ana',
  senderName: 'Marko',
  occasion: 'Srećna godišnjica',
  quizQuestions: [
    {
      question: 'Gde smo se prvi put poljubili?',
      answer: 'Kalemegdan',
      hint: 'Počinje na K...',
    },
    {
      question: 'Koja je moja omiljena hrana?',
      answer: 'Pizza',
      hint: 'Italijanska klasika',
    },
    {
      question: 'Koji datum je naš?',
      answer: '15.06.',
      hint: 'Jun mesec',
    },
  ],
  photos: [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd4a70?w=800&q=80',
  ],
  mainMessage:
    'Draga Ana, prošla si test — znači da me stvarno poznaješ. Svaki odgovor me podsetio na našu priču. Hvala ti što si deo mog sveta.',
  finaleText: 'Srećna godišnjica, moja ljubavi!',
  themeMode: 'preset',
  theme: 'violet',
  tier: 'premium',
}
