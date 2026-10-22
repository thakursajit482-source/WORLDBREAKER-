import { ArrowLeft, Orbit, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import { useState, useEffect } from 'react'
import { GravityLabScene } from './GravityLabScene'
import { GravityControls } from './GravityControls'
import { GravityTelemetry } from './GravityTelemetry'
import { useGravitySimulation } from './useGravitySimulation'
import { TVRemoteGuide } from '../../components/UI/TVRemoteGuide'

interface GravityLabViewProps {
  onBack: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
  playOpen: () => void
  playImpact: () => void
}

export function GravityLabView({
  onBack,
  soundEnabled,
  onToggleSound,
  playClick,
  playOpen,
  playImpact,
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
