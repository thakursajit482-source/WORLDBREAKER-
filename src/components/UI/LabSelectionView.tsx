import {
  ArrowLeft,
  Orbit,
  Flame,
  CloudRain,
  Lock,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Rocket,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { TVRemoteGuide } from './TVRemoteGuide'

interface LabSelectionViewProps {
  onSelectGravityLab: () => void
  onSelectAtmosphereLab?: () => void
  onSelectMissions?: () => void
  onStartMission?: (missionId: string) => void
  onBackToHome: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
}

export function LabSelectionView({
  onSelectGravityLab,
  onSelectAtmosphereLab,
  onSelectMissions,
  onStartMission,
  onBackToHome,
  soundEnabled,
  onToggleSound,
  playClick,
}: LabSelectionViewProps) {
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
      {/* Vignette Overlay */}
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
                onBackToHome()
              }}
              data-tv-focus="true"
              aria-label="Return to Orbit view"
              title="Return to Orbit view (Esc / Back)"
            >
              <ArrowLeft className="wb-back-icon" aria-hidden="true" />
              <span>ORBIT VIEW</span>
            </button>

            {onSelectMissions && (
              <button
                type="button"
                className="wb-back-btn"
                style={{ borderColor: 'rgba(169, 155, 255, 0.4)', color: '#a99bff' }}
                onClick={() => {
                  playClick()
                  onSelectMissions()
                }}
                data-tv-focus="true"
                aria-label="View Flight Training Missions"
                title="View Flight Training Missions"
              >
                <Rocket className="wb-back-icon" style={{ color: '#a99bff' }} aria-hidden="true" />
                <span>FLIGHT MISSIONS</span>
              </button>
            )}

            <div className="wb-badge">
              <span className="wb-badge-pulse" />
              <span className="wb-badge-text">SCIENCE STATION // MODULE SELECTOR</span>
            </div>
          </div>

          <div className="wb-header-right">
            <button
              type="button"
              className="wb-icon-button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute procedural audio' : 'Enable procedural audio'}
              title={soundEnabled ? 'Mute audio' : 'Enable audio'}
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
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
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

        {/* Modules Grid */}
        <main className="wb-selection-main" role="main">
          <div className="wb-selection-header">
            <h1 className="wb-selection-title">CHOOSE EXPERIMENT CHAMBER</h1>
            <p className="wb-selection-subtitle">
              Select an interactive laboratory to experiment with real-time celestial physics.
            </p>
          </div>

          <div className="wb-selection-grid">
            {/* Module 1: Gravity Lab (ACTIVE) */}
            <div className="wb-selection-card wb-card-active">
              <div className="wb-card-header">
                <div className="wb-card-icon-wrap wb-card-icon-cyan">
                  <Orbit className="wb-card-icon" aria-hidden="true" />
                </div>
                <div className="wb-card-meta">
                  <span className="wb-card-num">MODULE 01</span>
                  <h2 className="wb-card-title">Gravity Lab</h2>
                </div>
                <span className="wb-card-status-badge wb-status-online">● ACTIVE</span>
              </div>

              <p className="wb-card-desc">
                Interactive 3D free-fall vacuum chamber: drop a physical sphere from a 20-meter
                gantry tower, test Earth (9.81 m/s²), Moon (1.62 m/s²), and Jupiter (24.79 m/s²)
                presets, and analyze live kinematic trajectory metrics in real time.
              </p>

              <div className="wb-card-specs">
                <span className="wb-card-spec-item">Height: 20m</span>
                <span className="wb-card-spec-item">Range: 1 – 25 m/s²</span>
                <span className="wb-card-spec-item">Kinematics: s = ½gt²</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="wb-btn wb-btn-primary wb-btn-enter-lab"
                  onClick={() => {
                    playClick()
                    onSelectGravityLab()
                  }}
                  data-tv-focus="true"
                  autoFocus
                >
                  <span>ENTER GRAVITY LAB</span>
                  <ArrowRight className="wb-btn-icon" aria-hidden="true" />
                </button>

                {onStartMission && (
                  <button
                    type="button"
                    className="wb-btn wb-btn-secondary"
                    style={{ padding: '0.75rem 1.2rem', fontSize: '0.82rem' }}
                    onClick={() => {
                      playClick()
                      onStartMission('mission-gravity-01')
                    }}
                    data-tv-focus="true"
                  >
                    <Rocket size={15} aria-hidden="true" />
                    <span>START GRAVITY MISSION</span>
                  </button>
                )}
              </div>
            </div>

            {/* Module 2: Celestial Collision (LOCKED) */}
            <div className="wb-selection-card wb-card-locked">
              <div className="wb-card-header">
                <div className="wb-card-icon-wrap">
                  <Flame className="wb-card-icon" aria-hidden="true" />
                </div>
                <div className="wb-card-meta">
                  <span className="wb-card-num">MODULE 02</span>
                  <h2 className="wb-card-title">Collision Chamber</h2>
                </div>
                <span className="wb-card-status-badge wb-status-locked">
                  <Lock className="wb-icon-lock" aria-hidden="true" />
                  PHASE 3
                </span>
              </div>

              <p className="wb-card-desc">
                Simulate catastrophic planetary impact physics, kinetic energy propagation,
                crater scaling laws, and planetary ring fragmentation.
              </p>

              <div className="wb-card-specs">
                <span className="wb-card-spec-item">Kinetic Energy Transfer</span>
                <span className="wb-card-spec-item">Crater Morphology</span>
              </div>

              <button
                type="button"
                className="wb-btn wb-btn-secondary wb-btn-disabled"
                disabled
              >
                <span>COMING IN PHASE 3</span>
              </button>
            </div>

            {/* Module 3: Atmospheric Synthesizer (ACTIVE) */}
            <div
              className={`wb-selection-card ${
                onSelectAtmosphereLab ? 'wb-card-active' : 'wb-card-locked'
              }`}
            >
              <div className="wb-card-header">
                <div
                  className={`wb-card-icon-wrap ${
                    onSelectAtmosphereLab ? 'wb-card-icon-cyan' : ''
                  }`}
                >
                  <CloudRain className="wb-card-icon" aria-hidden="true" />
                </div>
                <div className="wb-card-meta">
                  <span className="wb-card-num">MODULE 03</span>
                  <h2 className="wb-card-title">Atmospheric Synthesizer</h2>
                </div>
                <span
                  className={`wb-card-status-badge ${
                    onSelectAtmosphereLab ? 'wb-status-online' : 'wb-status-locked'
                  }`}
                >
                  {onSelectAtmosphereLab ? '● ACTIVE' : 'PHASE 4'}
                </span>
              </div>

              <p className="wb-card-desc">
                Tune atmospheric density, observe Rayleigh limb scattering and Beer-Lambert
                extinction, and analyze real-time optical depth and surface pressure.
              </p>

              <div className="wb-card-specs">
                <span className="wb-card-spec-item">Rayleigh / Mie Optics</span>
                <span className="wb-card-spec-item">Density: 0.00 – 5.00×</span>
                <span className="wb-card-spec-item">Beer-Lambert Extinction</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {onSelectAtmosphereLab ? (
                  <button
                    type="button"
                    className="wb-btn wb-btn-primary wb-btn-enter-lab"
                    onClick={() => {
                      playClick()
                      onSelectAtmosphereLab()
                    }}
                    data-tv-focus="true"
                  >
                    <span>ENTER ATMOSPHERE LAB</span>
                    <ArrowRight className="wb-btn-icon" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="wb-btn wb-btn-secondary wb-btn-disabled"
                    disabled
                  >
                    <span>COMING IN PHASE 4</span>
                  </button>
                )}

                {onStartMission && (
                  <button
                    type="button"
                    className="wb-btn wb-btn-secondary"
                    style={{ padding: '0.75rem 1.2rem', fontSize: '0.82rem' }}
                    onClick={() => {
                      playClick()
                      onStartMission('mission-atmosphere-01')
                    }}
                    data-tv-focus="true"
                  >
                    <Rocket size={15} aria-hidden="true" />
                    <span>START ATMOSPHERE MISSION</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* TV Remote Guide */}
        <TVRemoteGuide />
      </div>
    </div>
  )
}
