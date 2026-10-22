import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Maximize, Minimize, Radio } from 'lucide-react'

interface HeaderProps {
  soundEnabled: boolean
  onToggleSound: () => void
}

export function Header({ soundEnabled, onToggleSound }: HeaderProps) {
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
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen may not be supported or allowed
      })
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <header className="wb-header" role="banner">
      <div className="wb-header-left">
        <div className="wb-badge">
          <span className="wb-badge-pulse" />
          <span className="wb-badge-text">PHASE 1 // ORBIT CORE</span>
        </div>
        <div className="wb-event-tag">AMAZON DEV HACKATHON 2026 • FIRE TV TRACK</div>
      </div>

      <div className="wb-header-right">
        <div className="wb-status-readout" aria-live="polite">
          <Radio className="wb-icon-small wb-icon-pulse" aria-hidden="true" />
          <span className="wb-status-text">SYSTEM ONLINE</span>
        </div>

        <button
          type="button"
          className="wb-icon-button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute procedural audio' : 'Enable procedural audio'}
          title={soundEnabled ? 'Mute audio' : 'Enable audio'}
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
          aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="wb-icon-btn" aria-hidden="true" />
          ) : (
            <Maximize className="wb-icon-btn" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  )
}
