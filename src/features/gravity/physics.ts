export const INITIAL_HEIGHT = 20.0 // meters
export const MIN_GRAVITY = 1.0 // m/s²
export const MAX_GRAVITY = 25.0 // m/s²
export const DEFAULT_GRAVITY = 9.81 // Earth m/s²

export interface GravityPreset {
  id: string
  name: string
  value: number // m/s²
  description: string
}

export const GRAVITY_PRESETS: GravityPreset[] = [
  { id: 'earth', name: 'Earth', value: 9.81, description: 'Standard terrestrial gravity' },
  { id: 'moon', name: 'Moon', value: 1.62, description: 'Lunar surface gravity (~16.5% Earth)' },
  { id: 'jupiter', name: 'Jupiter', value: 24.79, description: 'Gas giant surface gravity (~253% Earth)' },
]

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'impacted'

export interface SimulationState {
  initialHeight: number // h0 (20m)
  gravity: number // g (m/s²)
  elapsedTime: number // t (seconds)
  height: number // h (meters)
  velocity: number // v (m/s)
  distanceFallen: number // s (meters)
  status: SimulationStatus
  theoreticalImpactTime: number // t_impact = sqrt(2 * h0 / g)
  theoreticalImpactVelocity: number // v_impact = sqrt(2 * g * h0)
}

/**
 * Calculates theoretical time to impact floor from height h0 with gravity g.
 * t_impact = sqrt(2 * h0 / g)
 */
export function calculateImpactTime(initialHeight: number, gravity: number): number {
  if (gravity <= 0 || initialHeight <= 0) return 0
  return Math.sqrt((2 * initialHeight) / gravity)
}

/**
 * Calculates theoretical velocity at floor impact from height h0 with gravity g.
 * v_impact = sqrt(2 * g * h0) = g * t_impact
 */
export function calculateImpactVelocity(initialHeight: number, gravity: number): number {
  if (gravity <= 0 || initialHeight <= 0) return 0
  return Math.sqrt(2 * gravity * initialHeight)
}

/**
 * Calculates free fall kinematics at time t from rest:
 * s = 0.5 * g * t²
 * v = g * t
 * h = max(0, h0 - s)
 *
 * Clamps the ball at the floor and stops at impact.
 */
export function calculateFreeFall(
  initialHeight: number,
  gravity: number,
  elapsedTime: number
): {
  distanceFallen: number
  remainingHeight: number
  velocity: number
  isImpacted: boolean
} {
  if (elapsedTime <= 0) {
    return {
      distanceFallen: 0,
      remainingHeight: initialHeight,
      velocity: 0,
      isImpacted: false,
    }
  }

  const tImpact = calculateImpactTime(initialHeight, gravity)

  if (elapsedTime >= tImpact) {
    // Clamped at the floor
    return {
      distanceFallen: initialHeight,
      remainingHeight: 0,
      velocity: calculateImpactVelocity(initialHeight, gravity),
      isImpacted: true,
    }
  }

  const distanceFallen = 0.5 * gravity * elapsedTime * elapsedTime
  const remainingHeight = Math.max(0, initialHeight - distanceFallen)
  const velocity = gravity * elapsedTime

  return {
    distanceFallen,
    remainingHeight,
    velocity,
    isImpacted: remainingHeight <= 0,
  }
}

/**
 * Advances the simulation by delta-time dt using a fixed or stable timestep.
 * Keeps physics decoupled from rendering.
 */
export function stepPhysics(
  prevState: SimulationState,
  dt: number
): SimulationState {
  if (prevState.status !== 'running') {
    return prevState
  }

  const nextTime = prevState.elapsedTime + dt
  const kinematics = calculateFreeFall(
    prevState.initialHeight,
    prevState.gravity,
    nextTime
  )

  if (kinematics.isImpacted) {
    return {
      ...prevState,
      elapsedTime: prevState.theoreticalImpactTime,
      height: 0,
      velocity: prevState.theoreticalImpactVelocity,
      distanceFallen: prevState.initialHeight,
      status: 'impacted',
    }
  }

  return {
    ...prevState,
    elapsedTime: nextTime,
    height: kinematics.remainingHeight,
    velocity: kinematics.velocity,
    distanceFallen: kinematics.distanceFallen,
    status: 'running',
  }
}

/**
 * Initializes a clean simulation state.
 */
export function createInitialSimulationState(
  gravity: number = DEFAULT_GRAVITY,
  initialHeight: number = INITIAL_HEIGHT
): SimulationState {
  return {
    initialHeight,
    gravity,
    elapsedTime: 0,
    height: initialHeight,
    velocity: 0,
    distanceFallen: 0,
    status: 'idle',
    theoreticalImpactTime: calculateImpactTime(initialHeight, gravity),
    theoreticalImpactVelocity: calculateImpactVelocity(initialHeight, gravity),
  }
}
