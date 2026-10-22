import { Timer, Gauge, Orbit, Sun, Activity, Info, Moon } from 'lucide-react'
import type { RotationMetrics } from './rotationPhysics'

interface RotationTelemetryProps {
  metrics: RotationMetrics
  isPaused: boolean
}

export function RotationTelemetry({ metrics, isPaused }: RotationTelemetryProps) {
  const {
    period,
    angularVelocityDegPerHour,
    angularVelocityRadPerSec,
    equatorialSpeedKmH,
    equatorialSpeedMS,
    diurnalPhase,
    axialTiltDeg,
    speedMultiplier,
  } = metrics

  return (
    <aside className="wb-rotation-telemetry-panel" aria-label="Rotation Telemetry HUD">
      <div className="wb-telemetry-header">
        <div className="wb-telemetry-title">
          <Activity className="wb-icon-telemetry" aria-hidden="true" />
          <span>DIURNAL KINEMATICS</span>
        </div>
        <span className="wb-telemetry-live" data-active={!isPaused}>
          {!isPaused ? '● SYNCHRONIZED' : 'PAUSED'}
        </span>
      </div>

      <div className="wb-metrics-grid">
        {/* Metric 1: Rotation Period with Multi-Unit Conversions */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <Timer className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">ROTATION PERIOD</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value wb-highlight-cyan">
              {period.totalHours < 24
                ? period.totalHours.toFixed(1)
                : period.totalDays.toFixed(1)}
            </span>
            <span className="wb-metric-unit">
              {period.totalHours < 24 ? 'hours' : 'days'}
            </span>
          </div>
          <div className="wb-metric-sub">
            {period.formattedDetailed}
          </div>
        </div>

        {/* Metric 2: Angular Velocity */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <Gauge className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">ANGULAR VELOCITY</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value">{angularVelocityDegPerHour.toFixed(1)}</span>
            <span className="wb-metric-unit">°/hr</span>
          </div>
          <div className="wb-metric-sub">
            {angularVelocityRadPerSec.toExponential(2)} rad/s
          </div>
        </div>

        {/* Metric 3: Equatorial Surface Speed */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <Orbit className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">EQUATORIAL SPEED</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value wb-highlight-violet">
              {equatorialSpeedKmH.toLocaleString()}
            </span>
            <span className="wb-metric-unit">km/h</span>
          </div>
          <div className="wb-metric-sub">
            {equatorialSpeedMS.toLocaleString()} m/s at equator
          </div>
        </div>

        {/* Metric 4: Solar Time & Diurnal Phase */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <Sun className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">LOCAL SOLAR TIME</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value">{diurnalPhase.solarTime}</span>
          </div>
          <div className="wb-metric-sub" style={{ color: diurnalPhase.badgeColor }}>
            {diurnalPhase.phaseName}
          </div>
        </div>
      </div>

      {/* Diurnal Cycle Progress Bar */}
      <div className="wb-altitude-bar-container">
        <div className="wb-altitude-bar-label">
          <span className="wb-phase-desc-label">DIURNAL CYCLE ROTATION</span>
          <span>{diurnalPhase.percentProgress.toFixed(0)}% Complete</span>
        </div>
        <div className="wb-altitude-track">
          <div
            className="wb-altitude-fill"
            style={{ width: `${diurnalPhase.percentProgress}%` }}
          />
        </div>
        <div className="wb-phase-sub-note">
          {diurnalPhase.description}
        </div>
      </div>

      {/* Day / Night Terminator Science Card */}
      <div className="wb-terminator-status-card">
        <div className="wb-terminator-header">
          <div className="wb-terminator-title-wrap">
            <Sun className="wb-term-sun-icon" aria-hidden="true" />
            <span className="wb-term-slash">/</span>
            <Moon className="wb-term-moon-icon" aria-hidden="true" />
            <span className="wb-term-title">DAY / NIGHT TERMINATOR</span>
          </div>
          <span className="wb-term-badge">OBLIQUITY {axialTiltDeg}°</span>
        </div>
        <p className="wb-term-text">
          The terminator line separates the sunlit dayside from the dark nightside.
          Rotational speed determines day/night duration, while axial obliquity governs
          seasonal insolation balance.
        </p>
      </div>

      {/* Mechanics Reference */}
      <div className="wb-physics-formula-card">
        <div className="wb-formula-header">
          <Info className="wb-formula-icon" aria-hidden="true" />
          <span>CELESTIAL KINEMATICS CORE</span>
        </div>
        <div className="wb-formula-list">
          <code>T = 24.0h / S</code>
          <code>ω = 360° / T</code>
          <code>v_eq = 2πR / T</code>
          <code>S = {speedMultiplier.toFixed(2)}×</code>
        </div>
      </div>
    </aside>
  )
}
