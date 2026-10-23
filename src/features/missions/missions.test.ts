import { describe, it, expect } from 'vitest'
import {
  scoreQuiz,
  getScoreGrade,
  formatMetricWithUnit,
  validateDiscoveryData,
  calculateMetricDeviation,
} from './quizHelpers'
import { MISSIONS } from './missionData'
import type { QuizQuestion, ExperimentDiscoveryData } from './types'

describe('Mission & Learning Experience Tests', () => {
  const sampleQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      prompt: 'What accelerates matter in a vacuum?',
      options: ['Gravity', 'Magnetism', 'Friction', 'Solar wind'],
      correctIndex: 0,
      explanation: 'Gravity is the sole accelerating force in a vacuum.',
      scientificLaw: 'Universal Gravitation',
    },
    {
      id: 'q2',
      prompt: 'What is the kinematic relationship for free fall distance?',
      options: ['s = vt', 's = ½gt²', 's = ma', 's = v/t'],
      correctIndex: 1,
      explanation: 'Distance fallen is s = ½gt².',
      scientificLaw: 'Galilean Kinematics',
    },
    {
      id: 'q3',
      prompt: 'Why is the sky blue?',
      options: ['Ocean reflection', 'Rayleigh scattering', 'Ozone absorption', 'Doppler shift'],
      correctIndex: 1,
      explanation: 'Rayleigh scattering efficiency scales with 1/λ⁴.',
      scientificLaw: 'Rayleigh Scattering Law',
    },
  ]

  describe('Quiz Scoring Logic', () => {
    it('scores 100% when all answers are correct', () => {
      const userAnswers = { q1: 0, q2: 1, q3: 1 }
      const result = scoreQuiz(sampleQuestions, userAnswers)

      expect(result.totalQuestions).toBe(3)
      expect(result.correctCount).toBe(3)
      expect(result.scorePercentage).toBe(100)
      expect(result.passed).toBe(true)
    })

    it('scores partial credit and determines pass status at 70% threshold', () => {
      // 2 out of 3 correct = 67% -> fails threshold
      const userAnswersFail = { q1: 0, q2: 1, q3: 0 }
      const resultFail = scoreQuiz(sampleQuestions, userAnswersFail)

      expect(resultFail.correctCount).toBe(2)
      expect(resultFail.scorePercentage).toBe(67)
      expect(resultFail.passed).toBe(false)

      // 3 of 4 correct = 75% -> passes threshold
      const fourQuestions: QuizQuestion[] = [
        ...sampleQuestions,
        {
          id: 'q4',
          prompt: 'Another question',
          options: ['A', 'B'],
          correctIndex: 0,
          explanation: 'Exp',
        },
      ]
      const userAnswersPass = { q1: 0, q2: 1, q3: 1, q4: 1 } // 3 correct out of 4
      const resultPass = scoreQuiz(fourQuestions, userAnswersPass)
      expect(resultPass.scorePercentage).toBe(75)
      expect(resultPass.passed).toBe(true)
    })

    it('handles zero correct answers', () => {
      const userAnswers = { q1: 3, q2: 3, q3: 3 }
      const result = scoreQuiz(sampleQuestions, userAnswers)

      expect(result.correctCount).toBe(0)
      expect(result.scorePercentage).toBe(0)
      expect(result.passed).toBe(false)
    })

    it('safely handles empty questions or unanswered state', () => {
      const emptyResult = scoreQuiz([], {})
      expect(emptyResult.totalQuestions).toBe(0)
      expect(emptyResult.scorePercentage).toBe(0)

      const unansweredResult = scoreQuiz(sampleQuestions, {})
      expect(unansweredResult.correctCount).toBe(0)
      expect(unansweredResult.feedback['q1'].chosenOptionText).toBe('No answer provided')
    })
  })

  describe('Meaningful Answer Feedback', () => {
    it('provides comprehensive feedback for correct answers', () => {
      const userAnswers = { q1: 0 }
      const result = scoreQuiz(sampleQuestions, userAnswers)
      const fb = result.feedback['q1']

      expect(fb.isCorrect).toBe(true)
      expect(fb.chosenOptionText).toBe('Gravity')
      expect(fb.correctOptionText).toBe('Gravity')
      expect(fb.explanation).toContain('Gravity is the sole accelerating force')
      expect(fb.scientificLaw).toBe('Universal Gravitation')
    })

    it('provides instructive explanation and correct answer for incorrect answers', () => {
      const userAnswers = { q3: 0 } // chosen "Ocean reflection"
      const result = scoreQuiz(sampleQuestions, userAnswers)
      const fb = result.feedback['q3']

      expect(fb.isCorrect).toBe(false)
      expect(fb.chosenOptionText).toBe('Ocean reflection')
      expect(fb.correctOptionText).toBe('Rayleigh scattering')
      expect(fb.explanation).toContain('1/λ⁴')
      expect(fb.scientificLaw).toBe('Rayleigh Scattering Law')
    })

    it('assigns appropriate flight honor ranks based on score percentage', () => {
      const mastery = getScoreGrade(100)
      expect(mastery.badge).toBe('TOP HONORS')

      const passing = getScoreGrade(75)
      expect(passing.badge).toBe('MISSION ACCOMPLISHED')

      const cadet = getScoreGrade(50)
      expect(cadet.badge).toBe('FURTHER STUDY RECOMMENDED')
    })
  })

  describe('Discovery Summary Validation & Formatting', () => {
    const validData: ExperimentDiscoveryData = {
      labType: 'gravity-lab',
      labName: 'Gravity Vacuum Chamber',
      completedAt: '2026-10-22T12:00:00Z',
      parametersUsed: { Height: '20m', Gravity: '9.81 m/s²' },
      metrics: [
        {
          id: 'drop_time',
          label: 'Drop Duration',
          value: 2.02,
          unit: 's',
          theoreticalValue: 2.019,
        },
        {
          id: 'velocity',
          label: 'Impact Velocity',
          value: 19.81,
          unit: 'm/s',
          theoreticalValue: 19.809,
        },
      ],
      conclusion: 'Vacuum free fall verified.',
      scientificPrinciple: 'Galilean Equivalence',
    }

    it('validates genuine telemetry correctly', () => {
      const validation = validateDiscoveryData(validData)
      expect(validation.isValid).toBe(true)
      expect(validation.isEmpty).toBe(false)
    })

    it('flags null or undefined telemetry as empty', () => {
      const nullCheck = validateDiscoveryData(null)
      expect(nullCheck.isValid).toBe(false)
      expect(nullCheck.isEmpty).toBe(true)
    })

    it('flags data with empty metrics array as empty', () => {
      const emptyMetrics: ExperimentDiscoveryData = {
        ...validData,
        metrics: [],
      }
      const check = validateDiscoveryData(emptyMetrics)
      expect(check.isValid).toBe(false)
      expect(check.isEmpty).toBe(true)
    })

    it('detects invalid non-finite numbers in metrics', () => {
      const corruptData: ExperimentDiscoveryData = {
        ...validData,
        metrics: [
          {
            id: 'corrupt',
            label: 'Corrupt Metric',
            value: NaN,
            unit: 'm',
          },
        ],
      }
      const check = validateDiscoveryData(corruptData)
      expect(check.isValid).toBe(false)
      expect(check.errorReason).toContain('NaN')
    })

    it('formats metric values and scientific units accurately', () => {
      expect(formatMetricWithUnit(9.81, 'm/s²')).toBe('9.81 m/s²')
      expect(formatMetricWithUnit(2.0199, 's')).toBe('2.02 s')
      expect(formatMetricWithUnit('Terrestrial Super-Earth')).toBe('Terrestrial Super-Earth')
      expect(formatMetricWithUnit(null as unknown as number)).toBe('N/A')
    })

    it('calculates theoretical deviations and confirms kinematic tolerances', () => {
      // 2.02 vs 2.019 is ~0.05% deviation (well within 5% tolerance)
      const dev = calculateMetricDeviation(2.02, 2.019, 5.0)
      expect(dev.matches).toBe(true)
      expect(dev.percentDiff).toBeLessThan(1.0)

      // Far off: 10 vs 20 is 50% deviation -> fails tolerance
      const badDev = calculateMetricDeviation(10, 20, 5.0)
      expect(badDev.matches).toBe(false)
      expect(badDev.percentDiff).toBe(50.0)
    })
  })

  describe('Mission Definition Specifications', () => {
    it('ensures all missions have valid metadata and learning objectives', () => {
      for (const mission of MISSIONS) {
        expect(mission.id).toBeTruthy()
        expect(mission.code).toMatch(/^MSN-[A-Z]{3}-\d{2}$/)
        expect(mission.title).toBeTruthy()
        expect(mission.briefingText.length).toBeGreaterThan(30)
        expect(mission.learningObjectives.length).toBeGreaterThanOrEqual(2)
        expect(mission.taskInstructions.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('ensures active missions have complete and valid science quiz questions', () => {
      const activeMissions = MISSIONS.filter((m) => m.isAvailable)
      expect(activeMissions.length).toBeGreaterThanOrEqual(2)

      for (const mission of activeMissions) {
        expect(mission.questions.length).toBeGreaterThanOrEqual(3)
        for (const q of mission.questions) {
          expect(q.prompt).toBeTruthy()
          expect(q.options.length).toBeGreaterThanOrEqual(3)
          expect(q.correctIndex).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex).toBeLessThan(q.options.length)
          expect(q.explanation.length).toBeGreaterThan(20)
        }
      }
    })
  })
})
