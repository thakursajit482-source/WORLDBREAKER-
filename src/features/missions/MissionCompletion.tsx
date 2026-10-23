import {
  Trophy,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Activity,
  Award,
} from 'lucide-react'
import type { MissionDefinition, QuizResult, ExperimentDiscoveryData } from './types'
import { getScoreGrade, formatMetricWithUnit } from './quizHelpers'

export interface MissionCompletionProps {
  mission: MissionDefinition
  quizResult: QuizResult
  discoveryData?: ExperimentDiscoveryData | null
  onReplayMission: () => void
  onReturnToSelector: () => void
  className?: string
}

export function MissionCompletion({
  mission,
  quizResult,
  discoveryData,
  onReplayMission,
  onReturnToSelector,
  className = '',
}: MissionCompletionProps) {
  const grade = getScoreGrade(quizResult.scorePercentage)

  return (
    <div className={`wb-completion-layout ${className}`} role="region" aria-label="Mission Completion Debrief">
      <div className="wb-completion-card">
        {/* Victory Icon Badge */}
        <div className="wb-completion-badge-wrap">
          {quizResult.passed ? (
            <Trophy size={36} aria-hidden="true" />
          ) : (
            <Award size={36} aria-hidden="true" />
          )}
        </div>

        {/* Title & Code */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="wb-mission-code-badge">{mission.code}</span>
            <span className="wb-meta-pill" style={{ color: grade.color, borderColor: grade.color }}>
              {grade.badge}
            </span>
          </div>
          <h1 className="wb-completion-title">Mission Debrief Complete</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0.3rem 0 0 0' }}>
            {mission.title} — {mission.subtitle}
          </p>
        </div>

        {/* Score Callout */}
        <div className="wb-score-callout">
          <div className="wb-score-number">{quizResult.scorePercentage}%</div>
          <div className="wb-score-rank-title" style={{ color: grade.color }}>
            {grade.title}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            {quizResult.correctCount} of {quizResult.totalQuestions} Questions Answered Correctly
          </p>
        </div>

        {/* Learning Objectives Checklist */}
        <div style={{ width: '100%', textAlign: 'left', background: 'rgba(15, 25, 45, 0.6)', borderRadius: '12px', padding: '1.2rem' }}>
          <div className="wb-intro-section-title" style={{ marginBottom: '0.6rem' }}>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>OBJECTIVES VERIFIED</span>
          </div>
          <ul className="wb-intro-list">
            {mission.learningObjectives.map((obj, i) => (
              <li key={i} className="wb-intro-list-item" style={{ fontSize: '0.86rem' }}>
                <CheckCircle2 size={15} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Discovery Summary Snippet (if available) */}
        {discoveryData && discoveryData.metrics.length > 0 && (
          <div style={{ width: '100%', textAlign: 'left', background: 'rgba(15, 25, 45, 0.6)', borderRadius: '12px', padding: '1.2rem' }}>
            <div className="wb-intro-section-title" style={{ marginBottom: '0.6rem' }}>
              <Activity size={16} aria-hidden="true" />
              <span>RECORDED EXPERIMENT HIGHLIGHTS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {discoveryData.metrics.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: 'rgba(20, 34, 56, 0.8)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(85, 221, 245, 0.15)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: '#55ddf5', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatMetricWithUnit(m.value, m.unit)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="wb-completion-actions">
          <button
            type="button"
            className="wb-mission-btn wb-mission-btn-secondary"
            onClick={onReplayMission}
            data-tv-focus="true"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>REPLAY MISSION</span>
          </button>

          <button
            type="button"
            className="wb-mission-btn wb-mission-btn-primary"
            onClick={onReturnToSelector}
            data-tv-focus="true"
            autoFocus
          >
            <span>RETURN TO MISSIONS</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
