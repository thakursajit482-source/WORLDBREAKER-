import { useState, useCallback, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  BookOpen,
} from 'lucide-react'
import type { QuizQuestion, QuizResult } from './types'
import { scoreQuiz } from './quizHelpers'

export interface MissionQuizProps {
  questions: QuizQuestion[]
  onCompleteQuiz: (result: QuizResult) => void
  onExitQuiz?: () => void
  className?: string
}

export function MissionQuiz({
  questions,
  onCompleteQuiz,
  onExitQuiz,
  className = '',
}: MissionQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
  const [isAnswered, setIsAnswered] = useState(false)

  const currentQ = questions[currentIndex]
  const total = questions.length
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100)

  const selectedAnswer = currentQ ? userAnswers[currentQ.id] : undefined
  const isCorrect =
    currentQ && selectedAnswer !== undefined ? selectedAnswer === currentQ.correctIndex : false

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (isAnswered || !currentQ) return
      setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }))
      setIsAnswered(true)
    },
    [isAnswered, currentQ],
  )

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsAnswered(false)
    } else {
      const finalResult = scoreQuiz(questions, userAnswers)
      onCompleteQuiz(finalResult)
    }
  }, [currentIndex, total, questions, userAnswers, onCompleteQuiz])

  // Allow 1, 2, 3, 4 keyboard shortcuts to select options
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered && ['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        if (currentQ && idx >= 0 && idx < currentQ.options.length) {
          handleSelectOption(idx)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAnswered, currentQ, handleSelectOption])

  if (!currentQ) {
    return null
  }

  return (
    <div className={`wb-quiz-layout ${className}`} role="region" aria-label="Science Quiz">
      <div className="wb-quiz-card">
        {/* Progress Bar */}
        <div className="wb-quiz-progress-bar-wrap">
          <div
            className="wb-quiz-progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Header Meta */}
        <div className="wb-quiz-header-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={16} style={{ color: '#55ddf5' }} aria-hidden="true" />
            <span className="wb-quiz-step-count">
              QUESTION {currentIndex + 1} OF {total}
            </span>
          </div>

          <span className="wb-meta-pill">SCIENCE CERTIFICATION</span>
        </div>

        {/* Question Prompt */}
        <h2 className="wb-quiz-prompt">{currentQ.prompt}</h2>

        {/* Options List */}
        <div className="wb-quiz-options-list" role="radiogroup" aria-label="Answer options">
          {currentQ.options.map((optText, idx) => {
            const isSelected = selectedAnswer === idx
            const isThisCorrect = idx === currentQ.correctIndex

            let optionClass = 'wb-quiz-option-btn'
            if (isAnswered) {
              if (isThisCorrect) {
                optionClass += ' correct-choice'
              } else if (isSelected) {
                optionClass += ' incorrect-choice'
              }
            } else if (isSelected) {
              optionClass += ' selected'
            }

            return (
              <button
                key={idx}
                type="button"
                className={optionClass}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                data-tv-focus="true"
                role="radio"
                aria-checked={isSelected}
              >
                <span className="wb-option-key-badge">{idx + 1}</span>
                <span className="wb-option-text">{optText}</span>
                {isAnswered && isThisCorrect && (
                  <CheckCircle2 size={20} style={{ color: '#34d399', flexShrink: 0 }} aria-hidden="true" />
                )}
                {isAnswered && isSelected && !isThisCorrect && (
                  <XCircle size={20} style={{ color: '#f43f5e', flexShrink: 0 }} aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>

        {/* Answer Feedback & Scientific Explanation */}
        {isAnswered && (
          <div
            className={`wb-quiz-feedback-box ${
              isCorrect ? 'feedback-correct' : 'feedback-incorrect'
            }`}
            aria-live="polite"
          >
            <div className="wb-feedback-title">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} style={{ color: '#34d399' }} aria-hidden="true" />
                  <span className="wb-feedback-correct-title">Correct Analysis!</span>
                </>
              ) : (
                <>
                  <XCircle size={18} style={{ color: '#fb7185' }} aria-hidden="true" />
                  <span className="wb-feedback-incorrect-title">Incorrect Hypothesis</span>
                </>
              )}
            </div>

            {currentQ.scientificLaw && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.76rem',
                  color: '#a99bff',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                }}
              >
                <BookOpen size={13} aria-hidden="true" />
                <span>{currentQ.scientificLaw}</span>
              </div>
            )}

            <p className="wb-feedback-explanation">{currentQ.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="wb-intro-actions">
          {onExitQuiz && (
            <button
              type="button"
              className="wb-mission-btn wb-mission-btn-secondary"
              onClick={onExitQuiz}
              data-tv-focus="true"
            >
              <span>EXIT QUIZ</span>
            </button>
          )}

          {isAnswered && (
            <button
              type="button"
              className="wb-mission-btn wb-mission-btn-primary"
              onClick={handleNext}
              data-tv-focus="true"
              autoFocus
            >
              <span>{currentIndex < total - 1 ? 'NEXT QUESTION' : 'COMPLETE QUIZ'}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
