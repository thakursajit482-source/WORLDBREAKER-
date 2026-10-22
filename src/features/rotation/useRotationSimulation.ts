import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  DEFAULT_ROTATION_SPEED,
  MIN_ROTATION_SPEED,
  MAX_ROTATION_SPEED,
  ROTATION_PRESETS,
  type RotationPresetId,
  type RotationMetrics,
  calculateAllRotationMetrics,
  stepRotationAngle,
} from './rotationPhysics'

interface UseRotationSimulationOptions {
  initialSpeed?: number
  onPause?: () => void
  onResume?: () => void
  onReset?: () => void
}

export function useRotationSimulation({
  initialSpeed = DEFAULT_ROTATION_SPEED,
  onPause,
  onResume,
  onReset,
}: UseRotationSimulationOptions = {}) {
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(() =>
    Math.max(MIN_ROTATION_SPEED, Math.min(MAX_ROTATION_SPEED, initialSpeed))
  )
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [currentAngle, setCurrentAngle] = useState<number>(0)
  const [axialTiltEnabled, setAxialTiltEnabled] = useState<boolean>(true)

  const angleRef = useRef<number>(0)
  angleRef.current = currentAngle

  const speedRef = useRef<number>(speedMultiplier)
  speedRef.current = speedMultiplier

  const isPausedRef = useRef<boolean>(isPaused)
  isPausedRef.current = isPaused

  const lastTimestampRef = useRef<number | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Detect which preset matches the current speed (if any)
  const activePreset = useMemo<RotationPresetId | null>(() => {
    for (const key of Object.keys(ROTATION_PRESETS) as RotationPresetId[]) {
      if (Math.abs(ROTATION_PRESETS[key].speedMultiplier - speedMultiplier) < 0.05) {
        return key
      }
    }
    return null
  }, [speedMultiplier])

  // Compute live kinematics and telemetry metrics
  const metrics = useMemo<RotationMetrics>(
    () => calculateAllRotationMetrics(speedMultiplier, currentAngle),
    [speedMultiplier, currentAngle]
  )

  // Simulation delta-time loop
  const loop = useCallback((timestamp: number) => {
    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp
    }

    const delta = (timestamp - lastTimestampRef.current) / 1000
    lastTimestampRef.current = timestamp

    if (!isPausedRef.current && delta > 0) {
      const nextAngle = stepRotationAngle(angleRef.current, speedRef.current, delta, false)
      angleRef.current = nextAngle
      setCurrentAngle(nextAngle)
    }

    animFrameRef.current = requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [loop])

  const setSpeed = useCallback((newSpeed: number) => {
    const clamped = Math.max(MIN_ROTATION_SPEED, Math.min(MAX_ROTATION_SPEED, Number(newSpeed.toFixed(2))))
    setSpeedMultiplier(clamped)
  }, [])

  const selectPreset = useCallback((presetId: RotationPresetId) => {
    const preset = ROTATION_PRESETS[presetId]
    if (preset) {
      setSpeedMultiplier(preset.speedMultiplier)
    }
  }, [])

  const pause = useCallback(() => {
    setIsPaused(true)
    onPause?.()
  }, [onPause])

  const resume = useCallback(() => {
    setIsPaused(false)
    lastTimestampRef.current = null
    onResume?.()
  }, [onResume])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev
      if (next) {
        onPause?.()
      } else {
        lastTimestampRef.current = null
        onResume?.()
      }
      return next
    })
  }, [onPause, onResume])

  const reset = useCallback(() => {
    angleRef.current = 0
    setCurrentAngle(0)
    setSpeedMultiplier(DEFAULT_ROTATION_SPEED)
    setIsPaused(false)
    lastTimestampRef.current = null
    onReset?.()
  }, [onReset])

  const toggleAxialTilt = useCallback(() => {
    setAxialTiltEnabled((prev) => !prev)
  }, [])

  return {
    speedMultiplier,
    setSpeed,
    isPaused,
    pause,
    resume,
    togglePause,
    reset,
    currentAngle,
    activePreset,
    selectPreset,
    metrics,
    axialTiltEnabled,
    toggleAxialTilt,
  }
}
