import { useState, useCallback, useEffect, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ArrowLeft,
  RotateCcw,
  CloudRain,
  Sun,
  Activity,
  Shield,
  Info,
  Minus,
  Plus,
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import type { ExperimentDiscoveryData } from '../../features/missions/types'
import { StarsBackground } from '../Canvas3D/StarsBackground'
import { AtmospherePlanet3D } from './AtmospherePlanet3D'
import {
  ATMOSPHERE_PRESETS,
  calculateAtmosphereMetrics,
  type AtmospherePresetId,
} from './atmosphereLabHelpers'
import './AtmosphereLab.css'

export interface AtmosphereLabProps {
  /** Callback fired when the user selects 'Back to Orbit' or triggers Escape/Back */
  onBack?: () => void
  /** Callback fired when the user resets settings to initial baseline */
  onReset?: () => void
  /** Optional initial atmospheric density relative to Earth standard (default: 1.0) */
  initialDensity?: number
  /** Optional CSS class name for outer wrapper */
  className?: string
  /** Optional flag indicating running within a learning mission */
  missionMode?: boolean
  /** Callback to deliver measured telemetry to the mission discovery summary */
  onCompleteExperiment?: (data: ExperimentDiscoveryData) => void
}

export function AtmosphereLab({
  onBack,
  onReset,
  initialDensity = 1.0,
  className = '',
  missionMode = false,
  onCompleteExperiment,
}: AtmosphereLabProps) {
  const [density, setDensity] = useState<number>(() =>
    Math.max(0, Math.min(5.0, initialDensity)),
  )
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 })

  // Calculate live astrophysics and optical depth metrics
  const metrics = useMemo(() => calculateAtmosphereMetrics(density), [density])

  // Detect which illustrative preset is currently matched (if any)
  const matchedPreset = useMemo<AtmospherePresetId | null>(() => {
    for (const key of Object.keys(ATMOSPHERE_PRESETS) as AtmospherePresetId[]) {
      if (Math.abs(ATMOSPHERE_PRESETS[key].density - density) < 0.04) {
        return key
      }
    }
    return null
  }, [density])

  const handleDensityChange = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(5.0, Number(val.toFixed(2))))
    setDensity(clamped)
  }, [])

  const handleStep = useCallback((delta: number) => {
    setDensity((prev) => {
      const next = Math.max(0, Math.min(5.0, Number((prev + delta).toFixed(2))))
      return next
    })
  }, [])

  const handleSelectPreset = useCallback((presetId: AtmospherePresetId) => {
    const targetDensity = ATMOSPHERE_PRESETS[presetId].density
    setDensity(targetDensity)
  }, [])

  const handleReset = useCallback(() => {
    const resetVal = Math.max(0, Math.min(5.0, initialDensity))
    setDensity(resetVal)
    onReset?.()
  }, [initialDensity, onReset])

  const handleBack = useCallback(() => {
    onBack?.()
  }, [onBack])

  // Mouse / pointer parallax handler for gentle camera response
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = ((clientX / innerWidth) * 2 - 1) * 0.75
    const y = -((clientY / innerHeight) * 2 - 1) * 0.75
    setPointerOffset({ x, y })
  }, [])

  // Fire TV Remote & Keyboard Navigation Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Dismiss / Back handling
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack') {
        e.preventDefault()
        handleBack()
        return
      }

      // 2. Spatial Navigation for Fire TV D-Pad & Keyboard Arrows
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // If slider is currently focused and left/right is pressed, let native slider adjust
        if (
          document.activeElement?.id === 'atmo-density-slider' &&
          (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
        ) {
          return
        }

        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input[type="range"]:not([disabled]), [tabindex="0"]',
          ),
        ).filter((el) => el.offsetParent !== null)

        if (focusables.length === 0) return

        const currentActive = document.activeElement as HTMLElement
        const currentIndex = focusables.indexOf(currentActive)
        let nextIndex = 0

        if (currentIndex === -1) {
          nextIndex = 0
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % focusables.length
          e.preventDefault()
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + focusables.length) % focusables.length
          e.preventDefault()
        }

        focusables[nextIndex]?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleBack])

  return (
    <div
      className={`wb-atmo-container ${className}`}
      onPointerMove={handlePointerMove}
      role="region"
      aria-label="Atmosphere Laboratory Simulator"
    >
      {/* 3D WebGL Canvas Layer */}
      <div className="wb-atmo-canvas-wrap" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5.8], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
          }}
        >
          <color attach="background" args={['#080d19']} />

          {/* Restrained cinematic lighting */}
          <ambientLight color="#1e1b4b" intensity={0.65} />
          <directionalLight position={[6, 3.5, 5]} intensity={1.8} color="#e0f2fe" />
          <directionalLight position={[-6, -2, -3]} intensity={0.9} color="#818cf8" />

          <Suspense fallback={null}>
            <StarsBackground />
            <AtmospherePlanet3D density={density} pointerOffset={pointerOffset} />
          </Suspense>
        </Canvas>
      </div>

      {/* Cinematic Vignette */}
      <div className="wb-atmo-vignette" aria-hidden="true" />

      {/* Interactive UI Layer */}
      <div className="wb-atmo-ui-layer">
        {/* Header Bar */}
        <header className="wb-atmo-header">
          <div className="wb-atmo-header-left">
            <button
              type="button"
              className="wb-atmo-back-btn"
              onClick={handleBack}
              aria-label="Back to Orbit"
              data-tv-focus="true"
            >
              <ArrowLeft className="wb-atmo-icon-sm" aria-hidden="true" />
              <span>Back to Orbit</span>
            </button>

            <div className="wb-atmo-title-group">
              <span className="wb-atmo-kicker">
                <span className="wb-atmo-kicker-dot" />
                EXOPLANET LABORATORY // MODULE 03
              </span>
              <h1 className="wb-atmo-title">Atmospheric Synthesizer</h1>
            </div>
          </div>

          <div className="wb-atmo-header-right">
            {missionMode && onCompleteExperiment && (
              <button
                type="button"
                className="wb-mission-btn wb-mission-btn-primary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem' }}
                onClick={() => {
                  const data: ExperimentDiscoveryData = {
                    labType: 'atmosphere-lab',
                    labName: 'Atmospheric Synthesizer',
                    completedAt: new Date().toISOString(),
                    parametersUsed: {
                      'Density': `${density.toFixed(2)}× atm`,
                      'Scattering Regime': metrics.regimeName,
                    },
                    metrics: [
                      {
                        id: 'density',
                        label: 'Atmospheric Column Density',
                        value: density,
                        unit: '× Earth',
                        theoreticalValue: density,
                        description: 'Relative mass column density normalized to Earth standard.',
                      },
                      {
                        id: 'zenith_tau',
                        label: 'Zenith Optical Depth (τ_z)',
                        value: metrics.zenithOpticalDepth,
                        unit: 'τ',
                        theoreticalValue: Number((density * 0.22).toFixed(3)),
                        description: 'Vertical optical attenuation factor: τ = ρ * 0.22.',
                      },
                      {
                        id: 'limb_tau',
                        label: 'Limb Optical Depth (τ_limb)',
                        value: metrics.limbOpticalDepth,
                        unit: 'τ',
                        theoreticalValue: Number((density * 1.65).toFixed(3)),
                        description: 'Slant optical depth along tangential planetary limb.',
                      },
                      {
                        id: 'transmission',
                        label: 'Surface Direct Transmission (T)',
                        value: metrics.surfaceTransmissionPercent,
                        unit: '%',
                        theoreticalValue: Number((Math.exp(-metrics.zenithOpticalDepth) * 100).toFixed(1)),
                        description: 'Direct sunlight reaching surface via Beer-Lambert law: T = e⁻ᵠ.',
                      },
                      {
                        id: 'pressure',
                        label: 'Estimated Surface Pressure',
                        value: metrics.estimatedPressureKPa,
                        unit: 'kPa',
                        theoreticalValue: Number((density * 101.325).toFixed(1)),
                        description: 'Surface barometric pressure exerted by atmosphere.',
                      },
                    ],
                    conclusion:
                      'Increasing atmospheric column density results in exponential attenuation of direct sunlight (Beer-Lambert law) and shifts scattering from Rayleigh cyan-blue into dense Mie aerosol haze.',
                    scientificPrinciple: 'Rayleigh Scattering Law & Beer-Lambert Optical Extinction',
                  }
                  onCompleteExperiment(data)
                }}
                data-tv-focus="true"
              >
                <span>LOG TELEMETRY</span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="wb-atmo-btn-reset"
              onClick={handleReset}
              aria-label="Reset atmosphere to Earth normal"
              data-tv-focus="true"
            >
              <RotateCcw className="wb-atmo-icon-sm" aria-hidden="true" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </header>

        {/* Dual Panel Main Layout */}
        <main className="wb-atmo-main-grid">
          {/* LEFT PANEL: Interactive Density Controls & Presets */}
          <section className="wb-atmo-panel" aria-label="Atmospheric Density Controls">
            <div className="wb-atmo-panel-heading">
              <CloudRain className="wb-atmo-panel-icon" aria-hidden="true" />
              <span>DENSITY MODULATION</span>
            </div>

            {/* Density Slider Control */}
            <div className="wb-atmo-control-group">
              <div className="wb-atmo-slider-label-row">
                <label htmlFor="atmo-density-slider" className="wb-atmo-slider-label">
                  Atmospheric Column Density
                </label>
                <span
                  className="wb-atmo-density-val-display"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {density.toFixed(2)}× <small style={{ fontSize: '0.75rem' }}>atm</small>
                </span>
              </div>

              <div className="wb-atmo-slider-row">
                <button
                  type="button"
                  className="wb-atmo-step-btn"
                  onClick={() => handleStep(-0.1)}
                  aria-label="Decrease atmospheric density by 0.1"
                  data-tv-focus="true"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>

                <input
                  id="atmo-density-slider"
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.05"
                  value={density}
                  onChange={(e) => handleDensityChange(parseFloat(e.target.value))}
                  className="wb-atmo-range-slider"
                  aria-label="Atmospheric density slider from 0 to 5 times Earth normal"
                  aria-valuemin={0}
                  aria-valuemax={5.0}
                  aria-valuenow={density}
                  aria-valuetext={`${density.toFixed(2)} Earth normal atmospheres`}
                  data-tv-focus="true"
                />

                <button
                  type="button"
                  className="wb-atmo-step-btn"
                  onClick={() => handleStep(0.1)}
                  aria-label="Increase atmospheric density by 0.1"
                  data-tv-focus="true"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="wb-atmo-slider-bounds">
                <span>0.00 (Vacuum)</span>
                <span>1.00 (Earth)</span>
                <span>5.00 (Hyper-Dense)</span>
              </div>
            </div>

            {/* Illustrative Presets */}
            <div className="wb-atmo-presets-section">
              <div className="wb-atmo-presets-header">
                <span className="wb-atmo-subheading">ILLUSTRATIVE PRESETS</span>
              </div>

              {(['thin', 'earth', 'dense'] as AtmospherePresetId[]).map((presetId) => {
                const preset = ATMOSPHERE_PRESETS[presetId]
                const isActive = matchedPreset === presetId

                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`wb-atmo-preset-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset.id)}
                    aria-pressed={isActive}
                    data-tv-focus="true"
                  >
                    <div className="wb-atmo-preset-title-row">
                      <span className="wb-atmo-preset-name">{preset.label}</span>
                      <span className="wb-atmo-preset-pill">
                        {preset.density.toFixed(2)}×
                      </span>
                    </div>
                    <p className="wb-atmo-preset-desc">{preset.description}</p>
                  </button>
                )
              })}

              {/* Mandatory Illustrative Model Disclaimer */}
              <div className="wb-atmo-disclaimer-card" role="note">
                <Info className="wb-atmo-disclaimer-icon" aria-hidden="true" />
                <div>
                  <strong>Educational Model:</strong> These illustrative presets are
                  designed to demonstrate Rayleigh/Mie scattering dynamics in real-time,
                  not precise empirical measurements of specific planets.
                </div>
              </div>
            </div>
          </section>

          {/* Center Spacer: keeps 3D planet completely visible and unobstructed */}
          <div className="wb-atmo-center-spacer" aria-hidden="true" />

          {/* RIGHT PANEL: Live Telemetry HUD & Science Explanation */}
          <aside className="wb-atmo-panel" aria-label="Atmospheric Physics & Scattering HUD">
            <div className="wb-atmo-panel-heading">
              <Activity className="wb-atmo-panel-icon" aria-hidden="true" />
              <span>SCATTERING TELEMETRY</span>
            </div>

            {/* Live Metrics Readouts */}
            <div className="wb-atmo-metrics-list">
              <div className="wb-atmo-metric-row">
                <div className="wb-atmo-metric-label">
                  <Compass className="wb-atmo-metric-label-icon" aria-hidden="true" />
                  <span>REGIME</span>
                </div>
                <span
                  className="wb-atmo-metric-value"
                  style={{ color: metrics.regimeColor }}
                >
                  {metrics.regimeName}
                </span>
              </div>

              <div className="wb-atmo-metric-row">
                <div className="wb-atmo-metric-label">
                  <Sun className="wb-atmo-metric-label-icon" aria-hidden="true" />
                  <span>ZENITH OPTICAL DEPTH (τ)</span>
                </div>
                <span className="wb-atmo-metric-value wb-atmo-highlight-cyan">
                  {metrics.zenithOpticalDepth}
                </span>
              </div>

              <div className="wb-atmo-metric-row">
                <div className="wb-atmo-metric-label">
                  <Sparkles className="wb-atmo-metric-label-icon" aria-hidden="true" />
                  <span>LIMB OPTICAL DEPTH</span>
                </div>
                <span className="wb-atmo-metric-value wb-atmo-highlight-violet">
                  {metrics.limbOpticalDepth}
                </span>
              </div>

              <div className="wb-atmo-metric-row">
                <div className="wb-atmo-metric-label">
                  <Shield className="wb-atmo-metric-label-icon" aria-hidden="true" />
                  <span>SURFACE TRANSMISSION</span>
                </div>
                <span className="wb-atmo-metric-value wb-atmo-highlight-cyan">
                  {metrics.surfaceTransmissionPercent}%
                </span>
              </div>

              <div className="wb-atmo-metric-row">
                <div className="wb-atmo-metric-label">
                  <Activity className="wb-atmo-metric-label-icon" aria-hidden="true" />
                  <span>SURFACE PRESSURE</span>
                </div>
                <span className="wb-atmo-metric-value">
                  {metrics.estimatedPressureKPa} kPa ({metrics.estimatedPressureAtm} atm)
                </span>
              </div>

              <div className="wb-atmo-metric-row">
                <div className="wb-atmo-metric-label">
                  <CheckCircle2
                    className="wb-atmo-metric-label-icon"
                    aria-hidden="true"
                  />
                  <span>SURFACE HAZE</span>
                </div>
                <span className="wb-atmo-metric-value">{metrics.hazeLevel}</span>
              </div>
            </div>

            {/* Compact Science Explanation */}
            <div className="wb-atmo-science-info">
              <div className="wb-atmo-science-card">
                <h2 className="wb-atmo-science-card-title">
                  1. Rayleigh Scattering (1/λ⁴)
                </h2>
                <p className="wb-atmo-science-card-text">
                  Gas molecules scatter short wavelengths (blue/violet) far more intensely
                  than red. In moderate densities, this bathes the planetary limb in a
                  luminous cyan-blue halo.
                </p>
              </div>

              <div className="wb-atmo-science-card mie-card">
                <h2 className="wb-atmo-science-card-title">
                  2. Optical Depth & Mie Haze
                </h2>
                <p className="wb-atmo-science-card-text">
                  As density increases, Beer-Lambert attenuation (e⁻ᵠ) drops surface
                  transmission. Blue light scatters away completely, shifting limb glow
                  to warm amber hues and shrouding the surface in dense aerosols.
                </p>
              </div>
            </div>
          </aside>
        </main>

        {/* Footer: TV Remote Navigation Guide */}
        <footer className="wb-atmo-footer">
          <div className="wb-atmo-remote-legend">
            <span className="wb-atmo-key-pill">
              <span className="wb-atmo-key-badge">▲▼◄► D-PAD</span>
              <span>Navigate Elements</span>
            </span>
            <span className="wb-atmo-key-pill">
              <span className="wb-atmo-key-badge">SELECT / ENTER</span>
              <span>Activate</span>
            </span>
            <span className="wb-atmo-key-pill">
              <span className="wb-atmo-key-badge">BACK / ESC</span>
              <span>Return to Orbit</span>
            </span>
          </div>

          <div className="wb-atmo-status-tag">
            <span className="wb-atmo-status-pulse" />
            <span>REAL-TIME SCATTERING ENGINE // 60 FPS</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default AtmosphereLab
