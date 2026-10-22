import type {
  QuizQuestion,
  QuizResult,
  QuestionFeedback,
  ExperimentDiscoveryData,
} from './types'

/**
 * Calculates quiz scoring and generates detailed feedback for each question.
 */
export function scoreQuiz(
  questions: QuizQuestion[],
  userAnswers: Record<string, number>,
): QuizResult {
  if (!questions || questions.length === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      scorePercentage: 0,
      passed: false,
      userAnswers: {},
      feedback: {},
    }
  }

  let correctCount = 0
  const feedback: Record<string, QuestionFeedback> = {}

  for (const q of questions) {
    const chosenIndex = userAnswers[q.id]
    const hasAnswered = chosenIndex !== undefined && chosenIndex >= 0 && chosenIndex < q.options.length
    const isCorrect = hasAnswered && chosenIndex === q.correctIndex

    if (isCorrect) {
      correctCount++
    }

    feedback[q.id] = {
      isCorrect,
      chosenIndex: hasAnswered ? chosenIndex : -1,
      chosenOptionText: hasAnswered ? q.options[chosenIndex] : 'No answer provided',
      correctOptionText: q.options[q.correctIndex],
      explanation: q.explanation,
      scientificLaw: q.scientificLaw,
    }
  }

  const totalQuestions = questions.length
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100)
  const passed = scorePercentage >= 70

  return {
    totalQuestions,
    correctCount,
    scorePercentage,
    passed,
    userAnswers,
    feedback,
  }
}

/**
 * Formats score performance into an educational rating and badge.
 */
export function getScoreGrade(scorePercentage: number): {
  title: string
  badge: string
  color: string
} {
  if (scorePercentage === 100) {
    return {
      title: 'Astrophysics Specialist (Mastery)',
      badge: 'TOP HONORS',
      color: '#00f5ff',
    }
  }
  if (scorePercentage >= 70) {
    return {
      title: 'Certified Flight Researcher',
      badge: 'MISSION ACCOMPLISHED',
      color: '#55ddf5',
    }
  }
  return {
    title: 'Research Cadet',
    badge: 'FURTHER STUDY RECOMMENDED',
    color: '#fbbf24',
  }
}

/**
 * Formats an experiment metric value with standard scientific units.
 */
export function formatMetricWithUnit(value: number | string, unit?: string): string {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  const formattedVal = typeof value === 'number' ? Number(value.toFixed(2)).toString() : value
  return unit ? `${formattedVal} ${unit}` : `${formattedVal}`
}

/**
 * Validates whether experiment discovery telemetry was provided by the lab.
 */
export function validateDiscoveryData(
  data: ExperimentDiscoveryData | null | undefined,
): { isValid: boolean; isEmpty: boolean; errorReason?: string } {
  if (!data) {
    return {
      isValid: false,
      isEmpty: true,
      errorReason: 'No experimental telemetry received from laboratory chamber.',
    }
  }

  if (!data.metrics || data.metrics.length === 0) {
    return {
      isValid: false,
      isEmpty: true,
      errorReason: 'Telemetry packet exists but contains zero recorded measurements.',
    }
  }

  // Check for corrupted or non-numeric values in required metrics
  for (const metric of data.metrics) {
    if (typeof metric.value === 'number' && (isNaN(metric.value) || !isFinite(metric.value))) {
      return {
        isValid: false,
        isEmpty: false,
        errorReason: `Metric "${metric.label}" contains invalid or non-finite numerical value (${metric.value}).`,
      }
    }
  }

  return { isValid: true, isEmpty: false }
}

/**
 * Compares an observed experimental value against the theoretical astrophysics expectation.
 */
export function calculateMetricDeviation(
  actual: number,
  theoretical: number,
  tolerancePercent = 5.0,
): { diff: number; percentDiff: number; matches: boolean } {
  if (theoretical === 0) {
    const diff = Math.abs(actual)
    return { diff, percentDiff: diff === 0 ? 0 : 100, matches: diff < 0.05 }
  }

  const diff = Number(Math.abs(actual - theoretical).toFixed(3))
  const percentDiff = Number(((diff / Math.abs(theoretical)) * 100).toFixed(2))
  const matches = percentDiff <= tolerancePercent

  return { diff, percentDiff, matches }
}
