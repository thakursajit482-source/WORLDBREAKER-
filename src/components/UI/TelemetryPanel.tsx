import { Activity, Globe, Compass, Thermometer, Shield } from 'lucide-react'
import type { PlanetTelemetry } from '../../types'

const defaultTelemetry: PlanetTelemetry = {
  designation: 'WB-EXO-01α',
  classification: 'Terrestrial Super-Earth',
  diameterKm: 13420,
  surfaceGravityG: 1.08,
  surfaceTempC: 18.4,
  rotationPeriodHours: 25.4,
  orbitalVelocityKmS: 29.8,
  atmosphereComposition: 'N₂ 76% • O₂ 21% • Ar 1.2% • CH₄ 0.4%',
}

export function TelemetryPanel() {
  const data = defaultTelemetry

  return (
    <aside className="wb-telemetry-panel" aria-label="Orbital Telemetry HUD">
      <div className="wb-telemetry-header">
        <div className="wb-telemetry-title">
          <Activity className="wb-icon-telemetry" aria-hidden="true" />
          <span>CELESTIAL TELEMETRY</span>
        </div>
        <span className="wb-telemetry-live">LIVE FEED</span>
      </div>

      <div className="wb-telemetry-body">
        <div className="wb-telemetry-row">
          <div className="wb-telemetry-field">
            <Globe className="wb-field-icon" aria-hidden="true" />
            <span className="wb-field-label">DESIGNATION</span>
          </div>
          <span className="wb-field-val wb-highlight-cyan">{data.designation}</span>
        </div>

        <div className="wb-telemetry-row">
          <div className="wb-telemetry-field">
            <Compass className="wb-field-icon" aria-hidden="true" />
            <span className="wb-field-label">SURFACE GRAVITY</span>
          </div>
          <span className="wb-field-val">{data.surfaceGravityG} g</span>
        </div>

        <div className="wb-telemetry-row">
          <div className="wb-telemetry-field">
            <Thermometer className="wb-field-icon" aria-hidden="true" />
            <span className="wb-field-label">MEAN TEMP</span>
          </div>
          <span className="wb-field-val">{data.surfaceTempC} °C</span>
        </div>

        <div className="wb-telemetry-row">
          <div className="wb-telemetry-field">
            <Shield className="wb-field-icon" aria-hidden="true" />
            <span className="wb-field-label">DIAMETER</span>
          </div>
          <span className="wb-field-val">{data.diameterKm.toLocaleString()} km</span>
        </div>

        <div className="wb-telemetry-sub">
          <div className="wb-sub-label">ATMOSPHERIC PROFILE</div>
          <div className="wb-sub-val">{data.atmosphereComposition}</div>
        </div>
      </div>
    </aside>
  )
}
