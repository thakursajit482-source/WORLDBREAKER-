import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  ListOrdered,
  Lock,
} from 'lucide-react'
import type { MissionDefinition } from './types'

export interface MissionIntroProps {
  mission: MissionDefinition
  onLaunchLab: () => void
  onBackToMissions?: () => void
  className?: string
}

export function MissionIntro({
  mission,
  onLaunchLab,
  onBackToMissions,
  className = '',
}: MissionIntroProps) {
  return (
    <div className={`wb-intro-layout ${className}`} role="region" aria-label="Mission Introduction">
      <div className="wb-intro-card">
        {/* Header Row */}
        <div className="wb-intro-head-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="wb-mission-code-badge">{mission.code}</span>
              <span className="wb-meta-pill" style={{ textTransform: 'uppercase' }}>
                {mission.difficulty}
              </span>
            </div>
            <h1 className="wb-intro-main-title">{mission.title}</h1>
            <p className="wb-intro-subtitle">{mission.subtitle}</p>
          </div>

          <div className="wb-intro-meta-tags">
            <span className="wb-meta-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} aria-hidden="true" />
              <span>~{mission.estimatedMinutes} MIN</span>
            </span>
          </div>
        </div>

        {/* Mission Briefing */}
        <div className="wb-intro-briefing">
          <p style={{ margin: 0 }}>{mission.briefingText}</p>
        </div>

        {/* Learning Objectives */}
        <div>
          <div className="wb-intro-section-title">
            <Target size={16} aria-hidden="true" />
            <span>LEARNING OBJECTIVES</span>
          </div>
          <ul className="wb-intro-list">
            {mission.learningObjectives.map((obj, i) => (
              <li key={i} className="wb-intro-list-item">
                <CheckCircle2 className="wb-intro-check-icon" aria-hidden="true" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Task Instructions */}
        <div>
          <div className="wb-intro-section-title">
            <ListOrdered size={16} aria-hidden="true" />
            <span>MISSION TASKS</span>
          </div>
          <ul className="wb-intro-list">
            {mission.taskInstructions.map((task, i) => (
              <li key={i} className="wb-intro-list-item">
                <span className="wb-intro-number-badge">{i + 1}</span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="wb-intro-actions">
          {onBackToMissions && (
            <button
              type="button"
              className="wb-mission-btn wb-mission-btn-secondary"
              onClick={onBackToMissions}
              data-tv-focus="true"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>RETURN</span>
            </button>
          )}

          {mission.isAvailable ? (
            <button
              type="button"
              className="wb-mission-btn wb-mission-btn-primary"
              onClick={onLaunchLab}
              data-tv-focus="true"
              autoFocus
            >
              <Rocket size={18} aria-hidden="true" />
              <span>LAUNCH EXPERIMENT CHAMBER</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="wb-mission-btn wb-mission-btn-secondary"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            >
              <Lock size={16} aria-hidden="true" />
              <span>CHAMBER UNDER CALIBRATION (LOCKED)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
