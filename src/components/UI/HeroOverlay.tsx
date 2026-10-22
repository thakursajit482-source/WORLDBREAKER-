import { Sparkles, ArrowRight, BookOpen } from 'lucide-react'

interface HeroOverlayProps {
  onEnterLab: () => void
  onHowItWorks: () => void
}

export function HeroOverlay({ onEnterLab, onHowItWorks }: HeroOverlayProps) {
  return (
    <main className="wb-hero-overlay" role="main">
      <div className="wb-hero-content">
        {/* Futuristic Sub-Header Tag */}
        <div className="wb-kicker">
          <Sparkles className="wb-kicker-icon" aria-hidden="true" />
          <span>INTERACTIVE 3D CELESTIAL SCIENCE PLATFORM</span>
        </div>

        {/* Wordmark */}
        <h1 className="wb-wordmark" aria-label="WORLDBREAKER">
          <span className="wb-title-gradient">WORLD</span>
          <span className="wb-title-accent">BREAKER</span>
        </h1>

        {/* Tagline */}
        <p className="wb-tagline">The universe is yours to experiment with.</p>

        {/* Brief Description */}
        <p className="wb-description">
          An immersive science laboratory engineering real-time procedural astrophysics, planetary
          thermodynamics, and cosmic mechanics built for cinematic living room experiences.
        </p>

        {/* Action Button Row */}
        <div className="wb-cta-group" role="group" aria-label="Primary Actions">
          <button
            type="button"
            className="wb-btn wb-btn-primary"
            onClick={onEnterLab}
            data-tv-focus="true"
            autoFocus
          >
            <span className="wb-btn-text">ENTER THE LAB</span>
            <ArrowRight className="wb-btn-icon" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="wb-btn wb-btn-secondary"
            onClick={onHowItWorks}
            data-tv-focus="true"
          >
            <BookOpen className="wb-btn-icon" aria-hidden="true" />
            <span className="wb-btn-text">HOW IT WORKS</span>
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="wb-meta-strip">
          <div className="wb-meta-item">
            <span className="wb-meta-label">RENDERING</span>
            <span className="wb-meta-val">PROCEDURAL GLSL 60FPS</span>
          </div>
          <div className="wb-meta-divider" />
          <div className="wb-meta-item">
            <span className="wb-meta-label">ARCHITECTURE</span>
            <span className="wb-meta-val">REACT 19 + THREE.JS + R3F</span>
          </div>
          <div className="wb-meta-divider" />
          <div className="wb-meta-item">
            <span className="wb-meta-label">INPUT SUPPORT</span>
            <span className="wb-meta-val">FIRE TV REMOTE + KEYBOARD</span>
          </div>
        </div>
      </div>
    </main>
  )
}
