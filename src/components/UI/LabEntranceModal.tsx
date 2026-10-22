import { useEffect, useRef } from 'react'
import { X, Lock, CheckCircle2, Orbit, Flame, CloudRain } from 'lucide-react'

interface LabEntranceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LabEntranceModal({ isOpen, onClose }: LabEntranceModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="wb-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="wb-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-entrance-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wb-modal-header">
          <div className="wb-modal-title-group">
            <span className="wb-modal-kicker">SCIENCE STATION ACCESS</span>
            <h2 id="lab-entrance-title" className="wb-modal-title">
              Laboratory Console
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
          <div className="wb-callout-box">
            <CheckCircle2 className="wb-callout-icon" aria-hidden="true" />
            <div>
              <div className="wb-callout-title">Phase 1 Foundation Verified</div>
              <p className="wb-callout-desc">
                Procedural 3D planetary renderer, telemetry telemetry HUD, and Fire TV remote
                navigation are fully operational. Per development roadmap, experimentation modules
                are locked pending Phase 2 deployment authorization.
              </p>
            </div>
          </div>

          <div className="wb-modules-list">
            {/* Module 1: Gravity Lab */}
            <div className="wb-module-card wb-module-ready">
              <div className="wb-module-header">
                <div className="wb-module-icon-wrap">
                  <Orbit className="wb-module-icon" aria-hidden="true" />
                </div>
                <div className="wb-module-meta">
                  <div className="wb-module-number">LAB MODULE 01</div>
                  <h3 className="wb-module-name">Gravity & Orbital Dynamics</h3>
                </div>
                <span className="wb-module-pill wb-pill-pending">PHASE 2 READY</span>
              </div>
              <p className="wb-module-desc">
                Interactive celestial physics sandbox: modify planetary mass, calculate orbital
                eccentricity, test Keplerian velocities, and simulate gravitational slingshots.
              </p>
            </div>

            {/* Module 2: Collision Lab */}
            <div className="wb-module-card wb-module-locked">
              <div className="wb-module-header">
                <div className="wb-module-icon-wrap">
                  <Flame className="wb-module-icon" aria-hidden="true" />
                </div>
                <div className="wb-module-meta">
                  <div className="wb-module-number">LAB MODULE 02</div>
                  <h3 className="wb-module-name">Celestial Collision Chamber</h3>
                </div>
                <span className="wb-module-pill wb-pill-locked">
                  <Lock className="wb-pill-lock" aria-hidden="true" />
                  PHASE 3
                </span>
              </div>
              <p className="wb-module-desc">
                Simulate catastrophic planetary impact physics, kinetic energy propagation,
                crater formation, and planetary ring fragmentation.
              </p>
            </div>

            {/* Module 3: Atmosphere Lab */}
            <div className="wb-module-card wb-module-locked">
              <div className="wb-module-header">
                <div className="wb-module-icon-wrap">
                  <CloudRain className="wb-module-icon" aria-hidden="true" />
                </div>
                <div className="wb-module-meta">
                  <div className="wb-module-number">LAB MODULE 03</div>
                  <h3 className="wb-module-name">Atmospheric Synthesizer</h3>
                </div>
                <span className="wb-module-pill wb-pill-locked">
                  <Lock className="wb-pill-lock" aria-hidden="true" />
                  PHASE 4
                </span>
              </div>
              <p className="wb-module-desc">
                Tune greenhouse gas ratios, calculate albedo feedback loops, examine cloud opacity,
                and analyze planetary surface habitability thresholds.
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
            ACKNOWLEDGE & RETURN
          </button>
        </div>
      </div>
    </div>
  )
}
