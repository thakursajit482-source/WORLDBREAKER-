import { Play, Pause, RotateCcw, Compass, Sliders } from 'lucide-react'
import {
  GRAVITY_PRESETS,
  MIN_GRAVITY,
  MAX_GRAVITY,
  type SimulationState,
} from './physics'

interface GravityControlsProps {
  simulationState: SimulationState
  onDrop: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSelectGravity: (g: number) => void
}

export function GravityControls({
  simulationState,
  onDrop,
  onPause,
  onResume,
  onReset,
  onSelectGravity,
}: GravityControlsProps) {
  const { status, gravity } = simulationState
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isImpacted = status === 'impacted'
  const isIdle = status === 'idle'

  return (
    <section className="wb-gravity-controls-panel" aria-label="Experiment Control Console">
      <div className="wb-controls-header">
        <div className="wb-controls-title-wrap">
          <Compass className="wb-controls-icon" aria-hidden="true" />
          <h2 className="wb-controls-title">GRAVITATIONAL ACCELERATION</h2>
        </div>
        <div className="wb-status-tag" data-status={status}>
          {status.toUpperCase()}
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="wb-presets-group" role="group" aria-label="Celestial Gravity Presets">
        <span className="wb-group-label">PRESETS</span>
        <div className="wb-presets-grid">
          {GRAVITY_PRESETS.map((preset) => {
            const isSelected = Math.abs(gravity - preset.value) < 0.05
            return (
              <button
                key={preset.id}
                type="button"
                className={`wb-preset-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectGravity(preset.value)}
                data-tv-focus="true"
                aria-pressed={isSelected}
                title={preset.description}
              >
                <span className="wb-preset-name">{preset.name}</span>
                <span className="wb-preset-val">{preset.value} m/s²</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gravity Slider (1 to 25 m/s²) */}
      <div className="wb-slider-block">
        <div className="wb-slider-header">
          <label htmlFor="gravity-slider" className="wb-slider-label">
            <Sliders className="wb-slider-icon" aria-hidden="true" />
            <span>CUSTOM VALUE (1 – 25 m/s²)</span>
          </label>
          <span className="wb-slider-readout">
            <strong className="wb-readout-num">{gravity.toFixed(2)}</strong> m/s²
          </span>
        </div>

        <input
          id="gravity-slider"
          type="range"
          min={MIN_GRAVITY}
          max={MAX_GRAVITY}
          step={0.1}
          value={gravity}
          onChange={(e) => onSelectGravity(parseFloat(e.target.value))}
          className="wb-range-slider"
          data-tv-focus="true"
          aria-label="Gravitational acceleration in meters per second squared"
        />

        <div className="wb-slider-ticks">
          <span>1.0 m/s²</span>
          <span>13.0 m/s²</span>
          <span>25.0 m/s²</span>
        </div>
      </div>

      {/* Primary Action Buttons: DROP, PAUSE, RESUME, RESET */}
      <div className="wb-action-buttons-row">
        {/* DROP / RESUME / PAUSE Toggle */}
        {isIdle && (
          <button
            type="button"
            className="wb-btn wb-btn-primary wb-btn-action"
            onClick={onDrop}
            data-tv-focus="true"
            autoFocus
          >
            <Play className="wb-action-icon" aria-hidden="true" />
            <span>DROP BALL</span>
          </button>
        )}

        {isRunning && (
          <button
            type="button"
            className="wb-btn wb-btn-pause wb-btn-action"
            onClick={onPause}
            data-tv-focus="true"
            autoFocus
          >
            <Pause className="wb-action-icon" aria-hidden="true" />
            <span>PAUSE</span>
          </button>
        )}

        {isPaused && (
          <button
            type="button"
            className="wb-btn wb-btn-primary wb-btn-action"
            onClick={onResume}
            data-tv-focus="true"
            autoFocus
          >
            <Play className="wb-action-icon" aria-hidden="true" />
            <span>RESUME</span>
          </button>
        )}

        {isImpacted && (
          <button
            type="button"
            className="wb-btn wb-btn-primary wb-btn-action"
            onClick={onReset}
            data-tv-focus="true"
            autoFocus
          >
            <RotateCcw className="wb-action-icon" aria-hidden="true" />
            <span>RESET EXPERIMENT</span>
          </button>
        )}

        {/* RESET Button (Active during run, pause, or after impact) */}
        {!isImpacted && (
          <button
            type="button"
            className="wb-btn wb-btn-secondary wb-btn-action"
            onClick={onReset}
            disabled={isIdle}
            data-tv-focus="true"
            title="Reset to 20m start height"
          >
            <RotateCcw className="wb-action-icon" aria-hidden="true" />
            <span>RESET</span>
          </button>
        )}
      </div>
    </section>
  )
}
