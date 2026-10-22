import { Timer, ArrowDown, Gauge, Orbit, Info } from 'lucide-react'
import type { SimulationState } from './physics'

interface GravityTelemetryProps {
  simulationState: SimulationState
}

export function GravityTelemetry({ simulationState }: GravityTelemetryProps) {
  const {
    elapsedTime,
    height,
    velocity,
    gravity,
    initialHeight,
    theoreticalImpactTime,
    theoreticalImpactVelocity,
    status,
  } = simulationState

  const heightPercent = Math.max(0, Math.min(100, (height / initialHeight) * 100))

  return (
    <aside className="wb-gravity-telemetry-panel" aria-label="Live Physics Readouts">
      <div className="wb-telemetry-header">
        <div className="wb-telemetry-title">
          <Gauge className="wb-icon-telemetry" aria-hidden="true" />
          <span>KINEMATIC TELEMETRY</span>
        </div>
        <span className="wb-telemetry-live" data-active={status === 'running'}>
          {status === 'running' ? '● TRACKING' : status.toUpperCase()}
        </span>
      </div>

      <div className="wb-metrics-grid">
        {/* Metric 1: Elapsed Time */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <Timer className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">ELAPSED TIME</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value">{elapsedTime.toFixed(2)}</span>
            <span className="wb-metric-unit">s</span>
          </div>
          <div className="wb-metric-sub">
            Theoretical: {theoreticalImpactTime.toFixed(2)} s
          </div>
        </div>

        {/* Metric 2: Remaining Height */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <ArrowDown className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">REMAINING HEIGHT</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value wb-highlight-cyan">{height.toFixed(2)}</span>
            <span className="wb-metric-unit">m</span>
          </div>
          <div className="wb-metric-sub">
            Start: {initialHeight.toFixed(0)} m • Clamped: 0 m
          </div>
        </div>

        {/* Metric 3: Current Velocity */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <Gauge className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">INSTANT VELOCITY</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value wb-highlight-violet">{velocity.toFixed(2)}</span>
            <span className="wb-metric-unit">m/s</span>
          </div>
          <div className="wb-metric-sub">
            Impact V: {theoreticalImpactVelocity.toFixed(2)} m/s
          </div>
        </div>

        {/* Metric 4: Gravity Acceleration */}
        <div className="wb-metric-card">
          <div className="wb-metric-top">
            <Orbit className="wb-metric-icon" aria-hidden="true" />
            <span className="wb-metric-label">GRAVITY (g)</span>
          </div>
          <div className="wb-metric-value-wrap">
            <span className="wb-metric-value">{gravity.toFixed(2)}</span>
            <span className="wb-metric-unit">m/s²</span>
          </div>
          <div className="wb-metric-sub">
            Ratio: {(gravity / 9.81).toFixed(2)} × Earth
          </div>
        </div>
      </div>

      {/* Altitude Visualizer Bar */}
      <div className="wb-altitude-bar-container">
        <div className="wb-altitude-bar-label">
          <span>ALTITUDE TRAJECTORY</span>
          <span>{heightPercent.toFixed(0)}%</span>
        </div>
        <div className="wb-altitude-track">
          <div
            className="wb-altitude-fill"
            style={{ width: `${heightPercent}%` }}
          />
        </div>
      </div>

      {/* Physics Formula Footer */}
      <div className="wb-physics-formula-card">
        <div className="wb-formula-header">
          <Info className="wb-formula-icon" aria-hidden="true" />
          <span>CLASSICAL MECHANICS CORE</span>
        </div>
        <div className="wb-formula-list">
          <code>s = ½ · g · t²</code>
          <code>v = g · t</code>
          <code>t_impact = √(2·h₀ / g)</code>
        </div>
      </div>
    </aside>
  )
}
