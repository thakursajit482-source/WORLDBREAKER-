import { useEffect, useRef } from 'react'
import { X, Sun, Compass, Wind, Lock, CheckCircle2 } from 'lucide-react'

interface RotationEducationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RotationEducationModal({ isOpen, onClose }: RotationEducationModalProps) {
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
        aria-labelledby="rotation-edu-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wb-modal-header">
          <div className="wb-modal-title-group">
            <span className="wb-modal-kicker">SCIENCE BRIEFING</span>
            <h2 id="rotation-edu-title" className="wb-modal-title">
              Planetary Rotation & The Terminator
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
            {/* Topic 1: The Day/Night Terminator */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Sun className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">1. The Day/Night Terminator</h3>
              <p className="wb-spec-text">
                The <strong>terminator</strong> is the moving line dividing the sunlit day side
                and the shadowed night side. As the planet rotates eastward, surface observers
                cross the terminator into sunset (dusk) or sunrise (dawn). Along this line,
                light travels through maximum atmospheric path length, scattering short wavelengths
                and illuminating the twilight band in warm amber and crimson.
              </p>
            </div>

            {/* Topic 2: Rotation Speed & Angular Velocity */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Compass className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">2. Velocity & Equatorial Bulge</h3>
              <p className="wb-spec-text">
                All points on a rigid planet share the same angular velocity (e.g. 15°/hour on Earth),
                but linear speed scales with latitude: <code>v = ω · R · cos(lat)</code>. At Earth’s
                equator, the surface moves at <strong>1,670 km/h</strong>, tapering to 0 km/h at the poles.
                Rapid rotators like Jupiter (10h period) experience massive centrifugal forces,
                producing measurable oblateness (equatorial flattening).
              </p>
            </div>

            {/* Topic 3: The Coriolis Effect */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Wind className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">3. Atmospheric Coriolis Shear</h3>
              <p className="wb-spec-text">
                Planetary rotation exerts an apparent Coriolis force on fluid envelopes, deflecting
                moving winds eastward or westward. This breaks atmospheric circulation into multiple
                latitudinal convection cells (Hadley, Ferrel, and Polar cells), steering prevailing
                trade winds, jet streams, and cyclonic storm systems.
              </p>
            </div>

            {/* Topic 4: Tidal Locking & Extreme Worlds */}
            <div className="wb-spec-card">
              <div className="wb-spec-icon-wrap">
                <Lock className="wb-spec-icon" aria-hidden="true" />
              </div>
              <h3 className="wb-spec-heading">4. Tidal Locking & Synchronous Spin</h3>
              <p className="wb-spec-text">
                Gravitational tidal friction from a host star gradually dissipates a world’s rotational
                energy over billions of years until its rotational period equals its orbital period.
                Tidally locked planets possess a static terminator: one hemisphere endures perpetual
                scorching daylight while the other faces eternal cryogenic night.
              </p>
            </div>
          </div>

          <div className="wb-callout-box">
            <CheckCircle2 className="wb-callout-icon" aria-hidden="true" />
            <div>
              <div className="wb-callout-title">Interactive Exploration Tip</div>
              <p className="wb-callout-desc">
                Use the <strong>Slow</strong> preset (0.25×) to observe the terminator slowly sweep
                across continents, or the <strong>Fast</strong> preset (2.40×) to see rapid Jovian
                day/night alternations. Toggle <strong>Axial Obliquity</strong> to see how Earth’s
                23.44° tilt causes seasonal variation in daylight exposure.
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
            RETURN TO ROTATION LAB
          </button>
        </div>
      </div>
    </div>
  )
}
