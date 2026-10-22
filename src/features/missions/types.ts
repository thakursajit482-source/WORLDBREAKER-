export type MissionLabType = 'gravity-lab' | 'atmosphere-lab' | 'rotation-lab'

export type MissionDifficulty = 'cadet' | 'specialist' | 'commander'

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  scientificLaw?: string
}

export interface QuestionFeedback {
  isCorrect: boolean
  chosenIndex: number
  chosenOptionText: string
  correctOptionText: string
  explanation: string
  scientificLaw?: string
}

export interface QuizResult {
  totalQuestions: number
  correctCount: number
  scorePercentage: number
  passed: boolean
  userAnswers: Record<string, number>
  feedback: Record<string, QuestionFeedback>
}

export interface ExperimentMetricItem {
  id: string
  label: string
  value: number | string
  unit?: string
  theoreticalValue?: number | string
  tolerance?: string
  description?: string
  category?: 'kinematics' | 'optics' | 'atmosphere' | 'orbital'
}

export interface ExperimentDiscoveryData {
  labType: MissionLabType
  labName: string
  completedAt: string
  parametersUsed: Record<string, number | string>
  metrics: ExperimentMetricItem[]
  conclusion: string
  scientificPrinciple: string
}

export interface MissionDefinition {
  id: string
  code: string
  title: string
  subtitle: string
  labType: MissionLabType
  difficulty: MissionDifficulty
  estimatedMinutes: number
  learningObjectives: string[]
  taskInstructions: string[]
  briefingText: string
  questions: QuizQuestion[]
  isAvailable: boolean
  statusBadge?: string
}

export type MissionFlowStep = 'intro' | 'lab' | 'summary' | 'quiz' | 'completion'
