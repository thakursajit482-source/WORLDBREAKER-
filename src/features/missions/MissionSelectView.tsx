import {
  ArrowLeft,
  Rocket,
  Lock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { MISSIONS } from './missionData'
import type { MissionDefinition } from './types'
import { TVRemoteGuide } from '../../components/UI/TVRemoteGuide'
import './missions.css'

export interface MissionSelectViewProps {
  onSelectMission: (mission: MissionDefinition) => void
  onBackToLabSelect: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
}

export function MissionSelectView({
  onSelectMission,
  onBackToLabSelect,
  soundEnabled,
  onToggleSound,
  playClick,
}: MissionSelectViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="wb-selection-view">
      <div className="wb-vignette" aria-hidden="true" />

      <div className="wb-ui-layer">
        {/* Header */}
        <header className="wb-header" role="banner">
          <div className="wb-header-left">
            <button
              type="button"
              className="wb-back-btn"
              onClick={() => {
                playClick()
                onBackToLabSelect()
              }}
              data-tv-focus="true"
              aria-label="Return to Lab Selector"
              title="Return to Lab Selector"
            >
              <ArrowLeft className="wb-back-icon" aria-hidden="true" />
              <span>LAB SELECTOR</span>
            </button>

            <div className="wb-badge">
              <span className="wb-badge-pulse" />
              <span className="wb-badge-text">MISSION OPERATIONS // FLIGHT TRAINING</span>
            </div>
          </div>

          <div className="wb-header-right">
            <button
              type="button"
              className="wb-icon-button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
              data-tv-focus="true"
            >
              {soundEnabled ? (
                <Volume2 className="wb-icon-btn" aria-hidden="true" />
              ) : (
                <VolumeX className="wb-icon-btn" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="wb-icon-button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              data-tv-focus="true"
            >
              {isFullscreen ? (
                <Minimize className="wb-icon-btn" aria-hidden="true" />
              ) : (
                <Maximize className="wb-icon-btn" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* Missions Grid */}
        <main className="wb-selection-main" role="main">
          <div className="wb-selection-header">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={18} style={{ color: '#55ddf5' }} aria-hidden="true" />
              <span className="wb-kicker" style={{ margin: 0 }}>ASTROPHYSICS CERTIFICATION MISSIONS</span>
            </div>
            <h1 className="wb-selection-title">SELECT FLIGHT MISSION</h1>
            <p className="wb-selection-subtitle">
              Conduct guided scientific experiments, record live telemetry, and test your knowledge
              to earn science flight certifications.
            </p>
          </div>

          <div className="wb-selection-grid">
            {MISSIONS.map((mission) => {
              return (
                <div
                  key={mission.id}
                  className={`wb-selection-card ${
                    mission.isAvailable ? 'wb-card-active' : 'wb-card-locked'
                  }`}
                >
                  <div className="wb-card-header">
                    <div
                      className={`wb-card-icon-wrap ${
                        mission.isAvailable ? 'wb-card-icon-cyan' : ''
                      }`}
                    >
                      {mission.isAvailable ? (
                        <Rocket className="wb-card-icon" aria-hidden="true" />
                      ) : (
                        <Lock className="wb-card-icon" aria-hidden="true" />
                      )}
                    </div>
                    <div className="wb-card-meta">
                      <span className="wb-card-num">{mission.code}</span>
                      <h2 className="wb-card-title">{mission.title}</h2>
                    </div>
                    <span
                      className={`wb-card-status-badge ${
                        mission.isAvailable ? 'wb-status-online' : 'wb-status-locked'
                      }`}
                    >
                      {mission.statusBadge || (mission.isAvailable ? '● READY' : 'LOCKED')}
                    </span>
                  </div>

                  <p className="wb-card-desc">{mission.subtitle}</p>

                  <div className="wb-card-specs">
                    <span className="wb-card-spec-item" style={{ textTransform: 'uppercase' }}>
                      Level: {mission.difficulty}
                    </span>
                    <span className="wb-card-spec-item">~{mission.estimatedMinutes} mins</span>
                    <span className="wb-card-spec-item">
                      {mission.questions.length > 0
                        ? `${mission.questions.length} Quiz Questions`
                        : 'Calibrating'}
                    </span>
                  </div>

                  {mission.isAvailable ? (
                    <button
                      type="button"
                      className="wb-btn wb-btn-primary wb-btn-enter-lab"
                      onClick={() => {
                        playClick()
                        onSelectMission(mission)
                      }}
                      data-tv-focus="true"
                    >
                      <span>START MISSION BRIEFING</span>
                      <Rocket className="wb-btn-icon" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="wb-btn wb-btn-secondary wb-btn-disabled"
                      disabled
                    >
                      <span>CHAMBER CALIBRATING</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </main>

        <TVRemoteGuide />
      </div>
    </div>
  )
}
