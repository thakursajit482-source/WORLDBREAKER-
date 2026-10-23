import { ArrowLeft, Orbit, Volume2, VolumeX, Maximize, Minimize, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { GravityLabScene } from './GravityLabScene'
import { GravityControls } from './GravityControls'
import { GravityTelemetry } from './GravityTelemetry'
import { useGravitySimulation } from './useGravitySimulation'
import { TVRemoteGuide } from '../../components/UI/TVRemoteGuide'
import type { ExperimentDiscoveryData } from '../missions/types'

interface GravityLabViewProps {
  onBack: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
  playOpen: () => void
  playImpact: () => void
  missionMode?: boolean
  onCompleteExperiment?: (data: ExperimentDiscoveryData) => void
}

export function GravityLabView({
  onBack,
  soundEnabled,
  onToggleSound,
  playClick,
  playOpen,
  playImpact,
  missionMode = false,
  onCompleteExperiment,
}: GravityLabViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { state, drop, pause, resume, reset, setGravity } = useGravitySimulation({
    onDrop: playOpen,
    onImpact: playImpact,
    onPause: playClick,
    onResume: playClick,
    onReset: playClick,
  })

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
    <div className="wb-gravity-lab-view">
      {/* 3D Scene Viewport */}
      <GravityLabScene simulationState={state} />

      {/* Cinematic Vignette */}
      <div className="wb-vignette" aria-hidden="true" />

      {/* Lab UI Overlay */}
      <div className="wb-ui-layer wb-gravity-ui-layer">
        {/* Lab Top Header */}
        <header className="wb-lab-header" role="banner">
          <div className="wb-header-left">
            <button
              type="button"
              className="wb-back-btn"
              onClick={() => {
                playClick()
                onBack()
              }}
              data-tv-focus="true"
              aria-label="Return to Lab Selector"
              title="Return to Lab Selector (Esc / Back)"
            >
              <ArrowLeft className="wb-back-icon" aria-hidden="true" />
              <span>LAB SELECTOR</span>
            </button>

            <div className="wb-badge wb-lab-badge">
              <Orbit className="wb-lab-icon" aria-hidden="true" />
              <span className="wb-badge-text">MODULE 01 // FREE FALL GRAVITY LAB</span>
            </div>
          </div>

          <div className="wb-header-right">
            {missionMode && onCompleteExperiment && (
              <button
                type="button"
                className="wb-btn wb-btn-primary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem', height: '42px' }}
                onClick={() => {
                  playClick()
                  const elapsedVal =
                    state.status === 'impacted'
                      ? state.elapsedTime
                      : state.status === 'running' && state.elapsedTime > 0
                      ? state.elapsedTime
                      : state.theoreticalImpactTime
                  const velVal =
                    state.status === 'impacted'
                      ? state.velocity
                      : state.status === 'running' && state.velocity > 0
                      ? state.velocity
                      : state.theoreticalImpactVelocity

                  const data: ExperimentDiscoveryData = {
                    labType: 'gravity-lab',
                    labName: 'Gravity Vacuum Chamber',
                    completedAt: new Date().toISOString(),
                    parametersUsed: {
                      'Drop Height': `${state.initialHeight} m`,
                      'Surface Gravity': `${state.gravity} m/s²`,
                      'Sim Status': state.status.toUpperCase(),
                    },
                    metrics: [
                      {
                        id: 'drop_height',
                        label: 'Initial Drop Height',
                        value: state.initialHeight,
                        unit: 'm',
                        theoreticalValue: state.initialHeight,
                        description: 'Vertical height from gantry launch deck to floor.',
                      },
                      {
                        id: 'gravity',
                        label: 'Gravitational Acceleration (g)',
                        value: state.gravity,
                        unit: 'm/s²',
                        theoreticalValue: state.gravity,
                        description: 'Downward gravitational acceleration inside tower.',
                      },
                      {
                        id: 'time',
                        label: 'Elapsed Free-Fall Time (t)',
                        value: Number(elapsedVal.toFixed(3)),
                        unit: 's',
                        theoreticalValue: Number(state.theoreticalImpactTime.toFixed(3)),
                        description: 'Time to fall 20 meters: t = √(2h/g).',
                      },
                      {
                        id: 'velocity',
                        label: 'Impact Velocity (v)',
                        value: Number(velVal.toFixed(2)),
                        unit: 'm/s',
                        theoreticalValue: Number(state.theoreticalImpactVelocity.toFixed(2)),
                        description: 'Terminal velocity upon striking floor: v = √(2gh).',
                      },
                    ],
                    conclusion:
                      'In a vacuum with aerodynamic drag removed, gravitational acceleration acts on the object uniformly, verifying classical Newtonian mechanics (s = ½gt²).',
                    scientificPrinciple: 'Galilean Equivalence & Newtonian Kinematics',
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

        {/* Main Split Interface: Controls on Left, Telemetry on Right */}
        <main className="wb-lab-main-layout" role="main">
          <GravityControls
            simulationState={state}
            onDrop={drop}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onSelectGravity={setGravity}
          />

          <GravityTelemetry simulationState={state} />
        </main>

        {/* TV Remote & Keyboard Controls Footer */}
        <TVRemoteGuide />
      </div>
    </div>
  )
}
