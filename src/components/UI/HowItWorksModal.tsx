import { useEffect, useRef } from 'react'
import { X, Cpu, Tv, Compass, Layers } from 'lucide-react'

interface HowItWorksModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' ||
        e.key === 'Backspace' ||
        e.key === 'GoBack' ||
        e.key === 'Back' ||
        e.keyCode === 27 ||
        e.keyCode === 8 ||
        e.keyCode === 4
      ) {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="wb-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="wb-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wb-modal-header">
          <div className="wb-modal-title-group">
            <span className="wb-modal-kicker">SYSTEM SPECIFICATION</span>
            <h2 id="how-it-works-title" className="wb-modal-title">
              How WORLDBREAKER Works
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="wb-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
            data-tv-focus="true"
          >
            <X className="wb-icon-close" aria-hidden="true" />
          </button>
        </div>

        <div className="wb-modal-body">
          <div className="wb-spec-grid">
            {/* Feature 1 */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Cpu className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">1. Procedural 3D Astrophysics</h3>
              <p className="wb-spec-text">
                The planet is generated entirely in GPU hardware using procedural GLSL shaders.
                Multi-octave Fractional Brownian Motion (FBM) creates continents, oceans with
                specular sun glints, polar ice sheets, and animated swirling cloud layers without
                downloading static image textures.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Layers className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">2. Atmospheric Light Scattering</h3>
              <p className="wb-spec-text">
                Real-time Rayleigh and Mie atmospheric scattering equations calculate optical depth
                and limb glow. As the planet rotates, an exosphere halo responds to simulated star
                lighting with high-fidelity cyan and violet transitions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Tv className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">3. Fire TV 10-Foot Experience</h3>
              <p className="wb-spec-text">
                Tailored for big-screen television exploration. High-contrast neon cyan focus rings,
                spatial D-pad navigation, and keyboard arrow mapping enable seamless couch-based
                discovery with an Amazon Fire TV remote or keyboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Compass className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">4. Phase Progression Architecture</h3>
              <p className="wb-spec-text">
                <strong>Phase 1:</strong> Foundations, 3D celestial engine, HUD, and remote input.
                <br />
                <strong>Phase 2:</strong> Gravity Lab with interactive Keplerian orbital injection,
                N-body physics, and celestial trajectory controls.
              </p>
            </div>
          </div>
        </div>

        <div className="wb-modal-footer">
          <button
            type="button"
            className="wb-btn wb-btn-primary"
            onClick={onClose}
            data-tv-focus="true"
          >
            RETURN TO ORBIT
          </button>
        </div>
      </div>
    </div>
  )
}
