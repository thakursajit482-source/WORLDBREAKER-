import { Play, Pause, RotateCcw, Sliders, Compass, Minus, Plus, BookOpen } from 'lucide-react'
import {
  ROTATION_PRESETS,
  MIN_ROTATION_SPEED,
  MAX_ROTATION_SPEED,
  type RotationPresetId,
} from './rotationPhysics'

interface RotationControlsProps {
  speedMultiplier: number
  isPaused: boolean
  activePreset: RotationPresetId | null
  axialTiltEnabled: boolean
  onSetSpeed: (speed: number) => void
  onSelectPreset: (presetId: RotationPresetId) => void
  onTogglePause: () => void
  onReset: () => void
  onToggleAxialTilt: () => void
  onOpenEducation: () => void
}

export function RotationControls({
  speedMultiplier,
  isPaused,
  activePreset,
  axialTiltEnabled,
  onSetSpeed,
  onSelectPreset,
  onTogglePause,
  onReset,
  onToggleAxialTilt,
  onOpenEducation,
}: RotationControlsProps) {
  const handleStepSpeed = (delta: number) => {
    const next = Math.max(
      MIN_ROTATION_SPEED,
      Math.min(MAX_ROTATION_SPEED, Number((speedMultiplier + delta).toFixed(2)))
    )
    onSetSpeed(next)
  }

  return (
    <section className="wb-rotation-controls-panel" aria-label="Rotation Dynamics Control Console">
      <div className="wb-controls-header">
        <div className="wb-controls-title-wrap">
          <Compass className="wb-controls-icon" aria-hidden="true" />
          <h2 className="wb-controls-title">AXIAL ROTATION CONTROLS</h2>
        </div>
        <div className="wb-status-tag" data-status={isPaused ? 'paused' : 'running'}>
          {isPaused ? 'PAUSED' : 'ROTATING'}
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="wb-presets-group" role="group" aria-label="Planetary Rotation Presets">
        <span className="wb-group-label">ROTATION PRESETS</span>
        <div className="wb-presets-grid">
          {(Object.keys(ROTATION_PRESETS) as RotationPresetId[]).map((key) => {
            const preset = ROTATION_PRESETS[key]
            const isSelected = activePreset === key
            return (
              <button
                key={preset.id}
                type="button"
                className={`wb-preset-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectPreset(preset.id)}
                data-tv-focus="true"
                aria-pressed={isSelected}
                title={preset.description}
              >
                <span className="wb-preset-name">{preset.shortLabel}</span>
                <span className="wb-preset-val">{preset.periodHours.toFixed(0)}h Period</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rotation Speed Slider */}
      <div className="wb-slider-block">
        <div className="wb-slider-header">
          <label htmlFor="rotation-slider" className="wb-slider-label">
            <Sliders className="wb-slider-icon" aria-hidden="true" />
            <span>ROTATION SPEED (0.1× – 5.0×)</span>
          </label>
          <span className="wb-slider-readout">
            <strong className="wb-readout-num">{speedMultiplier.toFixed(2)}</strong> × Earth speed
          </span>
        </div>

        <div className="wb-slider-row-stepper">
          <button
            type="button"
            className="wb-step-btn"
            onClick={() => handleStepSpeed(-0.1)}
            disabled={speedMultiplier <= MIN_ROTATION_SPEED}
            data-tv-focus="true"
            aria-label="Decrease rotation speed by 0.1x"
            title="Decrease speed (-0.1x)"
          >
            <Minus className="wb-step-icon" aria-hidden="true" />
          </button>

          <input
            id="rotation-slider"
            type="range"
            min={MIN_ROTATION_SPEED}
            max={MAX_ROTATION_SPEED}
            step={0.1}
            value={speedMultiplier}
            onChange={(e) => onSetSpeed(parseFloat(e.target.value))}
            className="wb-range-slider"
            data-tv-focus="true"
            aria-label="Planetary rotation speed multiplier"
          />

          <button
            type="button"
            className="wb-step-btn"
            onClick={() => handleStepSpeed(0.1)}
            disabled={speedMultiplier >= MAX_ROTATION_SPEED}
            data-tv-focus="true"
            aria-label="Increase rotation speed by 0.1x"
            title="Increase speed (+0.1x)"
          >
            <Plus className="wb-step-icon" aria-hidden="true" />
          </button>
        </div>

        <div className="wb-slider-ticks">
          <span>0.10× (Slow)</span>
          <span>1.00× (Earth)</span>
          <span>5.00× (Hyper)</span>
        </div>
      </div>

      {/* Axial Obliquity / Tilt Toggle */}
      <div className="wb-tilt-toggle-row">
        <button
          type="button"
          className={`wb-toggle-pill-btn ${axialTiltEnabled ? 'active' : ''}`}
          onClick={onToggleAxialTilt}
          data-tv-focus="true"
          aria-pressed={axialTiltEnabled}
          title="Toggle 23.44° Earth axial inclination"
        >
          <span className="wb-toggle-label">AXIAL OBLIQUITY</span>
          <span className="wb-toggle-state">
            {axialTiltEnabled ? '23.44° ACTIVE' : '0° PERPENDICULAR'}
          </span>
        </button>

        <button
          type="button"
          className="wb-btn-edu-toggle"
          onClick={onOpenEducation}
          data-tv-focus="true"
          title="Open Day/Night & Terminator Science Guide"
        >
          <BookOpen className="wb-edu-icon" aria-hidden="true" />
          <span>SCIENCE GUIDE</span>
        </button>
      </div>

      {/* Action Buttons: Pause/Resume, Reset */}
      <div className="wb-action-buttons-row">
        <button
          type="button"
          className={`wb-btn wb-btn-action ${isPaused ? 'wb-btn-primary' : 'wb-btn-pause'}`}
          onClick={onTogglePause}
          data-tv-focus="true"
          autoFocus
        >
          {isPaused ? (
            <>
              <Play className="wb-action-icon" aria-hidden="true" />
              <span>RESUME ROTATION</span>
            </>
          ) : (
            <>
              <Pause className="wb-action-icon" aria-hidden="true" />
              <span>PAUSE ROTATION</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="wb-btn wb-btn-secondary wb-btn-action"
          onClick={onReset}
          data-tv-focus="true"
          title="Reset rotation angle to noon and speed to 1.0x"
        >
          <RotateCcw className="wb-action-icon" aria-hidden="true" />
          <span>RESET</span>
        </button>
      </div>
    </section>
  )
}
