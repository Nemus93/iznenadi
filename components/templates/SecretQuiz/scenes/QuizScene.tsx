'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperienceTheme } from '@/components/experience/ThemeProvider'
import { sceneBackground } from '@/lib/themes/resolve-theme'
import { answersMatch, type SecretQuizPayload } from '@/lib/types/secret-quiz'

const MAX_ATTEMPTS = 3

interface QuizSceneProps {
  data: SecretQuizPayload
  onComplete: () => void
}

export default function QuizScene({ data, onComplete }: QuizSceneProps) {
  const theme = useExperienceTheme()
  const [questionIndex, setQuestionIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [celebrating, setCelebrating] = useState(false)
  const [shake, setShake] = useState(false)

  const question = data.quizQuestions[questionIndex]
  const total = data.quizQuestions.length
  const isLastQuestion = questionIndex === total - 1

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    if (answersMatch(input, question.answer)) {
      setFeedback('correct')
      if (isLastQuestion) {
        setCelebrating(true)
        setTimeout(() => onComplete(), 1400)
      } else {
        setTimeout(() => {
          setQuestionIndex((i) => i + 1)
          setAttempts(0)
          setInput('')
          setFeedback('idle')
        }, 800)
      }
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setFeedback('wrong')
    setShake(true)
    setTimeout(() => setShake(false), 500)

    if (nextAttempts >= MAX_ATTEMPTS) {
      setInput('')
      setAttempts(0)
    }
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: sceneBackground(theme) }}
    >
      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="mb-2 text-xs tracking-[0.3em] uppercase" style={{ color: theme.accentMuted }}>
            tajni kviz · {questionIndex + 1}/{total}
          </p>
          <div className="mx-auto mb-4 flex gap-1.5">
            {data.quizQuestions.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    i < questionIndex
                      ? theme.accent
                      : i === questionIndex
                        ? `${theme.accent}cc`
                        : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 backdrop-blur-sm"
            >
              <h2 className="mb-6 text-center font-serif text-2xl leading-snug font-bold text-white">
                {question.question}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    if (feedback === 'wrong') setFeedback('idle')
                  }}
                  placeholder="Tvoj odgovor..."
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-center text-white placeholder:text-white/30 focus:border-pink-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || feedback === 'correct'}
                  className="w-full rounded-full py-3 text-sm font-medium text-white transition disabled:opacity-40"
                  style={{ backgroundColor: theme.accent }}
                >
                  Proveri odgovor
                </button>
              </form>

              <div className="mt-4 min-h-[3rem] text-center text-sm">
                {feedback === 'wrong' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: theme.accentMuted }}
                  >
                    {attempts >= MAX_ATTEMPTS
                      ? 'Probaj ponovo — razmisli malo duže.'
                      : question.hint && attempts >= 2
                        ? `Hint: ${question.hint}`
                        : 'Nije tačno. Pokušaj ponovo.'}
                  </motion.p>
                )}
                {feedback === 'correct' && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ color: theme.accent }}
                  >
                    Tačno! {isLastQuestion ? 'Otključavam poruku...' : 'Sledeće pitanje...'}
                  </motion.p>
                )}
              </div>

              <p className="mt-2 text-center text-xs text-white/30">
                Pokušaj {attempts}/{MAX_ATTEMPTS}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            >
              <p className="text-6xl">🎉</p>
              <p className="mt-4 font-serif text-2xl font-bold text-white">Sve tačno!</p>
              <p className="mt-2 text-sm" style={{ color: theme.accentMuted }}>
                Otključavam poruku...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
