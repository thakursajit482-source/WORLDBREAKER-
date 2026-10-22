import { useState, useEffect } from 'react'
import { ArrowLeft, Orbit, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import { RotationLabScene } from './RotationLabScene'
import { RotationControls } from './RotationControls'
import { RotationTelemetry } from './RotationTelemetry'
import { RotationEducationModal } from './RotationEducationModal'
import { useRotationSimulation } from './useRotationSimulation'
import { TVRemoteGuide } from '../../components/UI/TVRemoteGuide'

interface RotationLabViewProps {
  onBack: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
  playOpen: () => void
}

export function RotationLabView({
  onBack,
  soundEnabled,
  onToggleSound,
  playClick,
  playOpen,
}: RotationLabViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isEducationOpen, setIsEducationOpen] = useState(false)

  const {
    speedMultiplier,
    setSpeed,
    isPaused,
    togglePause,
    reset,
    currentAngle,
    activePreset,
    metrics,
    axialTiltEnabled,
    toggleAxialTilt,
    selectPreset,
  } = useRotationSimulation({
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
    <div className="wb-rotation-lab-view">
      {/* 3D Scene Viewport with Rotating Planet and Terminator */}
      <RotationLabScene
        currentAngle={currentAngle}
        axialTiltEnabled={axialTiltEnabled}
      />

      {/* Cinematic Vignette */}
      <div className="wb-vignette" aria-hidden="true" />

      {/* Lab UI Overlay */}
      <div className="wb-ui-layer wb-rotation-ui-layer">
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
              <span className="wb-badge-text">MODULE 04 // PLANETARY ROTATION LAB</span>
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
          <RotationControls
            speedMultiplier={speedMultiplier}
            isPaused={isPaused}
            activePreset={activePreset}
            axialTiltEnabled={axialTiltEnabled}
            onSetSpeed={setSpeed}
            onSelectPreset={(p) => {
              playClick()
              selectPreset(p)
            }}
            onTogglePause={togglePause}
            onReset={reset}
            onToggleAxialTilt={() => {
              playClick()
              toggleAxialTilt()
            }}
            onOpenEducation={() => {
              playOpen()
              setIsEducationOpen(true)
            }}
          />

          <RotationTelemetry metrics={metrics} isPaused={isPaused} />
        </main>

        {/* TV Remote & Keyboard Controls Footer */}
        <TVRemoteGuide />
      </div>

      {/* Educational Science Modal */}
      <RotationEducationModal
        isOpen={isEducationOpen}
        onClose={() => {
          playClick()
          setIsEducationOpen(false)
        }}
      />
    </div>
  )
}
