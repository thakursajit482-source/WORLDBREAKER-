import {
  ArrowLeft,
  Orbit,
  Flame,
  CloudRain,
  Compass,
  Lock,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { TVRemoteGuide } from './TVRemoteGuide'

interface LabSelectionViewProps {
  onSelectGravityLab: () => void
  onSelectRotationLab: () => void
  onSelectAtmosphereLab?: () => void
  onBackToHome: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
}

export function LabSelectionView({
  onSelectGravityLab,
  onSelectRotationLab,
  onSelectAtmosphereLab,
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
            </div>

            {/* Module 2: Rotation Lab (ACTIVE - PHASE 4) */}
            <div className="wb-selection-card wb-card-active">
              <div className="wb-card-header">
                <div className="wb-card-icon-wrap wb-card-icon-cyan">
                  <Compass className="wb-card-icon" aria-hidden="true" />
                </div>
                <div className="wb-card-meta">
                  <span className="wb-card-num">MODULE 02</span>
                  <h2 className="wb-card-title">Rotation Lab</h2>
                </div>
                <span className="wb-card-status-badge wb-status-online">● ACTIVE</span>
              </div>

              <p className="wb-card-desc">
                Interactive 3D planetary rotation chamber: simulate diurnal cycles, observe the
                moving day/night terminator twilight band, test Slow (0.25×), Earth-like (1.00×),
                and Rapid (2.40×) presets, and inspect angular and equatorial velocity.
              </p>

              <div className="wb-card-specs">
                <span className="wb-card-spec-item">Speed: 0.10 – 5.00×</span>
                <span className="wb-card-spec-item">Terminator Line</span>
                <span className="wb-card-spec-item">Obliquity: 23.4°</span>
              </div>

              <button
                type="button"
                className="wb-btn wb-btn-primary wb-btn-enter-lab"
                onClick={() => {
                  playClick()
                  onSelectRotationLab()
                }}
                data-tv-focus="true"
              >
                <span>ENTER ROTATION LAB</span>
                <ArrowRight className="wb-btn-icon" aria-hidden="true" />
              </button>
            </div>

            {/* Module 3: Atmosphere Lab (ACTIVE) */}
            <div className="wb-selection-card wb-card-active">
              <div className="wb-card-header">
                <div className="wb-card-icon-wrap wb-card-icon-cyan">
                  <CloudRain className="wb-card-icon" aria-hidden="true" />
                </div>
                <div className="wb-card-meta">
                  <span className="wb-card-num">MODULE 03</span>
                  <h2 className="wb-card-title">Atmosphere Lab</h2>
                </div>
                <span className="wb-card-status-badge wb-status-online">● ACTIVE</span>
              </div>

              <p className="wb-card-desc">
                Tune atmospheric column density (0.00 – 5.00×), calculate Rayleigh and Mie optical
                depth (Beer-Lambert attenuation), examine sunlight surface transmission, and
                explore planetary greenhouse regimes.
              </p>

              <div className="wb-card-specs">
                <span className="wb-card-spec-item">Density: 0 – 5.0×</span>
                <span className="wb-card-spec-item">Rayleigh / Mie</span>
                <span className="wb-card-spec-item">Transmission: e⁻ᵀ</span>
              </div>

              <button
                type="button"
                className="wb-btn wb-btn-primary wb-btn-enter-lab"
                onClick={() => {
                  playClick()
                  if (onSelectAtmosphereLab) {
                    onSelectAtmosphereLab()
                  }
                }}
                data-tv-focus="true"
              >
                <span>ENTER ATMOSPHERE LAB</span>
                <ArrowRight className="wb-btn-icon" aria-hidden="true" />
              </button>
            </div>

            {/* Module 4: Celestial Collision (LOCKED) */}
            <div className="wb-selection-card wb-card-locked">
              <div className="wb-card-header">
                <div className="wb-card-icon-wrap">
                  <Flame className="wb-card-icon" aria-hidden="true" />
                </div>
                <div className="wb-card-meta">
                  <span className="wb-card-num">MODULE 04</span>
                  <h2 className="wb-card-title">Collision Chamber</h2>
                </div>
                <span className="wb-card-status-badge wb-status-locked">
                  <Lock className="wb-icon-lock" aria-hidden="true" />
                  UPCOMING
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
                <span>COMING SOON</span>
              </button>
            </div>
          </div>
        </main>

        {/* TV Remote Guide */}
        <TVRemoteGuide />
      </div>
    </div>
  )
}
