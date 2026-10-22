import { useState, useRef, useCallback, useEffect } from 'react'
import {
  INITIAL_HEIGHT,
  DEFAULT_GRAVITY,
  MIN_GRAVITY,
  MAX_GRAVITY,
  type SimulationState,
  createInitialSimulationState,
  stepPhysics,
  calculateImpactTime,
  calculateImpactVelocity,
} from './physics'

interface UseGravitySimulationOptions {
  onImpact?: () => void
  onDrop?: () => void
  onPause?: () => void
  onResume?: () => void
  onReset?: () => void
}

export function useGravitySimulation(options: UseGravitySimulationOptions = {}) {
  const { onImpact, onDrop, onPause, onResume, onReset } = options

  const [state, setState] = useState<SimulationState>(() =>
    createInitialSimulationState(DEFAULT_GRAVITY, INITIAL_HEIGHT)
  )

  const stateRef = useRef(state)
  stateRef.current = state

  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const accumulatorRef = useRef<number>(0)

  const FIXED_TIMESTEP = 1 / 120 // 120Hz fixed physics step for maximum precision

  const cancelLoop = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    lastTimeRef.current = null
    accumulatorRef.current = 0
  }, [])

  // Main stable physics loop
  const loop = useCallback(
    (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }

      // Elapsed wall-clock time in seconds, clamped to avoid spiral-of-death on background tabs
      const frameDelta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = timestamp

      accumulatorRef.current += frameDelta

      let currentState = stateRef.current

      // Sub-step physics using fixed timestep
      while (accumulatorRef.current >= FIXED_TIMESTEP) {
        if (currentState.status !== 'running') {
          break
        }

        currentState = stepPhysics(currentState, FIXED_TIMESTEP)
        accumulatorRef.current -= FIXED_TIMESTEP

        if (currentState.status === 'impacted') {
          accumulatorRef.current = 0
          break
        }
      }

      stateRef.current = currentState
      setState(currentState)

      if (currentState.status === 'running') {
        animFrameRef.current = requestAnimationFrame(loop)
      } else {
        cancelLoop()
        if (currentState.status === 'impacted') {
          onImpact?.()
        }
      }
    },
    [cancelLoop, onImpact]
  )

  const drop = useCallback(() => {
    if (stateRef.current.status === 'running') return

    // If impacted or non-idle, reset before dropping
    const baseState =
      stateRef.current.status === 'impacted'
        ? createInitialSimulationState(stateRef.current.gravity, INITIAL_HEIGHT)
        : stateRef.current

    const nextState: SimulationState = {
      ...baseState,
      status: 'running',
    }

    stateRef.current = nextState
    setState(nextState)
    lastTimeRef.current = null
    accumulatorRef.current = 0
    animFrameRef.current = requestAnimationFrame(loop)
    onDrop?.()
  }, [loop, onDrop])

  const pause = useCallback(() => {
    if (stateRef.current.status !== 'running') return
    cancelLoop()
    const nextState: SimulationState = {
      ...stateRef.current,
      status: 'paused',
    }
    stateRef.current = nextState
    setState(nextState)
    onPause?.()
  }, [cancelLoop, onPause])

  const resume = useCallback(() => {
    if (stateRef.current.status !== 'paused') return
    const nextState: SimulationState = {
      ...stateRef.current,
      status: 'running',
    }
    stateRef.current = nextState
    setState(nextState)
    lastTimeRef.current = null
    accumulatorRef.current = 0
    animFrameRef.current = requestAnimationFrame(loop)
    onResume?.()
  }, [loop, onResume])

  const reset = useCallback(() => {
    cancelLoop()
    const nextState = createInitialSimulationState(stateRef.current.gravity, INITIAL_HEIGHT)
    stateRef.current = nextState
    setState(nextState)
    onReset?.()
  }, [cancelLoop, onReset])

  const setGravity = useCallback(
    (newGravity: number) => {
      const clamped = Math.max(MIN_GRAVITY, Math.min(MAX_GRAVITY, Number(newGravity.toFixed(2))))
      const wasRunning = stateRef.current.status === 'running'

      cancelLoop()

      const nextState: SimulationState = {
        ...createInitialSimulationState(clamped, INITIAL_HEIGHT),
        gravity: clamped,
        theoreticalImpactTime: calculateImpactTime(INITIAL_HEIGHT, clamped),
        theoreticalImpactVelocity: calculateImpactVelocity(INITIAL_HEIGHT, clamped),
      }

      stateRef.current = nextState
      setState(nextState)

      if (wasRunning) {
        onReset?.()
      }
    },
    [cancelLoop, onReset]
  )

  useEffect(() => {
    return () => cancelLoop()
  }, [cancelLoop])

  return {
    state,
    drop,
    pause,
    resume,
    reset,
    setGravity,
  }
}
