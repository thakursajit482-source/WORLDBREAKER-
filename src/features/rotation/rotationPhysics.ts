/**
 * Planetary Rotation & Diurnal Kinematics Engine.
 * Pure mathematical functions for orbital/axial period, angular velocity,
 * equatorial linear velocity, unit conversions, and delta-time integration.
 */

export const EARTH_ROTATION_PERIOD_HOURS = 24.0 // Standard terrestrial solar day
export const EARTH_RADIUS_KM = 6371.0 // Mean Earth radius
export const EARTH_EQUATORIAL_CIRCUMFERENCE_KM = 2 * Math.PI * EARTH_RADIUS_KM // ~40,030 km
export const AXIAL_TILT_DEG = 23.44 // Earth's obliquity to ecliptic
export const AXIAL_TILT_RAD = (AXIAL_TILT_DEG * Math.PI) / 180 // ~0.409 rad

export const MIN_ROTATION_SPEED = 0.1 // 0.1x Earth speed (240 hours / 10 days)
export const MAX_ROTATION_SPEED = 5.0 // 5.0x Earth speed (4.8 hours)
export const DEFAULT_ROTATION_SPEED = 1.0 // 1.0x Earth speed (24.0 hours)

/**
 * Base visual rotation rate in radians per second at 1.0x speed.
 * Calibrated so at 1.0x speed the 3D globe completes a visual revolution
 * in ~18 seconds, giving an engaging, smooth visual experience.
 */
export const VISUAL_BASE_RAD_PER_SEC = 0.35

export type RotationPresetId = 'slow' | 'earth' | 'fast'

export interface RotationPreset {
  id: RotationPresetId
  name: string
  shortLabel: string
  speedMultiplier: number
  periodHours: number
  tag: string
  tagColor: string
  description: string
  astronomicalAnalog: string
}

export const ROTATION_PRESETS: Record<RotationPresetId, RotationPreset> = {
  slow: {
    id: 'slow',
    name: 'Slow / Venusian Drift',
    shortLabel: 'Slow (0.25×)',
    speedMultiplier: 0.25,
    periodHours: 96.0,
    tag: 'EXTENDED DIURNAL CYCLE',
    tagColor: '#38bdf8',
    description:
      'Super-extended day/night cycles. The sun crawls across the sky over 96 hours, causing deep nightside radiative cooling and prolonged dayside solar heating.',
    astronomicalAnalog: 'Analogous to slowly rotating worlds like Venus (243d) or Mercury (58.6d).',
  },
  earth: {
    id: 'earth',
    name: 'Standard / Earth-like',
    shortLabel: 'Standard (1.00×)',
    speedMultiplier: 1.0,
    periodHours: 24.0,
    tag: 'EQUILIBRIUM 24H DAY',
    tagColor: '#55ddf5',
    description:
      'Balanced 24-hour diurnal cycle. Sustains moderate day/night temperature swings and stable atmospheric circulation cells (Hadley, Ferrel, Polar).',
    astronomicalAnalog: 'Earth baseline (24.0 hours) and Mars analog (24.6 hours).',
  },
  fast: {
    id: 'fast',
    name: 'Rapid / Jovian Spin',
    shortLabel: 'Rapid (2.40×)',
    speedMultiplier: 2.4,
    periodHours: 10.0,
    tag: 'HIGH CORIOLIS SHEAR',
    tagColor: '#c084fc',
    description:
      'Hyper-rapid planetary rotation. Strong Coriolis forces create banded atmospheric jet streams, high equatorial bulge, and rapid 5-hour day/night alternating cycles.',
    astronomicalAnalog: 'Analogous to gas giants like Jupiter (9.93h) and Saturn (10.7h).',
  },
}

export interface RotationPeriodConversion {
  totalHours: number
  totalSeconds: number
  totalDays: number
  hoursComponent: number
  minutesComponent: number
  formattedShort: string
  formattedDetailed: string
}

export interface DiurnalPhaseInfo {
  phaseName: string
  solarTime: string
  percentProgress: number
  description: string
  badgeColor: string
}

export interface RotationMetrics {
  speedMultiplier: number
  period: RotationPeriodConversion
  angularVelocityDegPerHour: number
  angularVelocityRadPerSec: number
  equatorialSpeedKmH: number
  equatorialSpeedMS: number
  diurnalPhase: DiurnalPhaseInfo
  axialTiltDeg: number
}

/**
 * Calculates theoretical rotation period in hours based on speed multiplier.
 * T = 24.0 / speedMultiplier
 */
export function calculateRotationPeriodHours(speedMultiplier: number): number {
  const clamped = Math.max(MIN_ROTATION_SPEED, Math.min(MAX_ROTATION_SPEED, speedMultiplier))
  return Number((EARTH_ROTATION_PERIOD_HOURS / clamped).toFixed(2))
}

/**
 * Calculates rotation period in seconds.
 */
export function calculateRotationPeriodSeconds(speedMultiplier: number): number {
  return calculateRotationPeriodHours(speedMultiplier) * 3600
}

/**
 * Formats rotation period into multiple human-readable units (days, hours, minutes).
 */
export function formatRotationPeriod(periodHours: number): RotationPeriodConversion {
  const totalHours = Math.max(0.1, periodHours)
  const totalSeconds = totalHours * 3600
  const totalDays = Number((totalHours / 24.0).toFixed(2))

  const wholeHours = Math.floor(totalHours)
  const minutesComponent = Math.round((totalHours - wholeHours) * 60)
  const hoursComponent = wholeHours

  let formattedShort: string
  let formattedDetailed: string

  if (totalHours >= 24.0) {
    formattedShort = `${totalDays.toFixed(1)} days`
    formattedDetailed = `${totalDays.toFixed(1)} Earth days (${totalHours.toFixed(1)} hours)`
  } else if (totalHours >= 1.0) {
    formattedShort = `${totalHours.toFixed(1)} hours`
    formattedDetailed = `${hoursComponent}h ${minutesComponent.toString().padStart(2, '0')}m (${totalHours.toFixed(2)}h)`
  } else {
    const totalMinutes = Math.round(totalHours * 60)
    formattedShort = `${totalMinutes} min`
    formattedDetailed = `${totalMinutes} minutes (${totalSeconds.toFixed(0)}s)`
  }

  return {
    totalHours: Number(totalHours.toFixed(2)),
    totalSeconds: Number(totalSeconds.toFixed(1)),
    totalDays,
    hoursComponent,
    minutesComponent,
    formattedShort,
    formattedDetailed,
  }
}

/**
 * Calculates angular velocity in degrees per hour.
 * omega = 360 / T_hours
 */
export function calculateAngularVelocityDegPerHour(periodHours: number): number {
  if (periodHours <= 0) return 0
  return Number((360.0 / periodHours).toFixed(2))
}

/**
 * Calculates angular velocity in radians per second.
 * omega = 2pi / T_seconds
 */
export function calculateAngularVelocityRadPerSec(periodHours: number): number {
  if (periodHours <= 0) return 0
  const seconds = periodHours * 3600
  return Number(((2 * Math.PI) / seconds).toExponential(4))
}

/**
 * Calculates linear velocity at the equator in km/h.
 * v_eq = Circumference / T_hours
 */
export function calculateEquatorialSpeedKmH(periodHours: number): number {
  if (periodHours <= 0) return 0
  return Number((EARTH_EQUATORIAL_CIRCUMFERENCE_KM / periodHours).toFixed(1))
}

/**
 * Calculates linear velocity at the equator in m/s.
 * v_eq = (Circumference * 1000) / (T_hours * 3600)
 */
export function calculateEquatorialSpeedMS(periodHours: number): number {
  const kmh = calculateEquatorialSpeedKmH(periodHours)
  return Number((kmh / 3.6).toFixed(1))
}

/**
 * Evaluates the current diurnal cycle phase from the prime meridian rotation angle.
 * Angle normalized to [0, 2pi].
 * 0 or 2pi = Solar Noon (Facing Sun)
 * pi / 2 = Sunset / Dusk (Passing Terminator into Darkness)
 * pi = Solar Midnight (Facing Away from Sun)
 * 3pi / 2 = Sunrise / Dawn (Passing Terminator into Sunlight)
 */
export function calculateDiurnalPhase(angleRad: number): DiurnalPhaseInfo {
  // Normalize angle to [0, 2pi)
  const twoPi = 2 * Math.PI
  const normalized = ((angleRad % twoPi) + twoPi) % twoPi
  const percentProgress = Number(((normalized / twoPi) * 100).toFixed(1))

  // Map to local solar time: 0 rad = 12:00 (Noon)
  const hoursFraction = (12.0 + (normalized / twoPi) * 24.0) % 24.0
  const hour = Math.floor(hoursFraction)
  const minute = Math.floor((hoursFraction - hour) * 60)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  const solarTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`

  let phaseName = 'Daylight'
  let description = 'Prime meridian is fully sunlit on the dayside hemisphere.'
  let badgeColor = '#55ddf5'

  // 4 quadrants with 8 subdivisions
  if (normalized >= 0.785 && normalized < 2.356) {
    // ~pi/2
    phaseName = 'Dusk / Terminator Crossing'
    description = 'Entering the twilight zone. The sun sinks below the local horizon.'
    badgeColor = '#fbbf24'
  } else if (normalized >= 2.356 && normalized < 3.927) {
    // ~pi
    phaseName = 'Deep Nightside'
    description = 'Hemisphere turned away from the sun. Night-side city lights illuminate.'
    badgeColor = '#c084fc'
  } else if (normalized >= 3.927 && normalized < 5.498) {
    // ~3pi/2
    phaseName = 'Dawn / Sunrise Boundary'
    description = 'Crossing the morning terminator. First daylight illuminates the horizon.'
    badgeColor = '#38bdf8'
  } else {
    phaseName = 'High Noon / Subsolar'
    description = 'Direct zenith solar exposure. Peak surface temperature and irradiance.'
    badgeColor = '#55ddf5'
  }

  return {
    phaseName,
    solarTime,
    percentProgress,
    description,
    badgeColor,
  }
}

/**
 * Calculates all live rotation metrics for a given speed multiplier and rotation angle.
 */
export function calculateAllRotationMetrics(
  speedMultiplier: number,
  currentAngleRad: number = 0
): RotationMetrics {
  const periodHours = calculateRotationPeriodHours(speedMultiplier)
  const period = formatRotationPeriod(periodHours)
  const angularVelocityDegPerHour = calculateAngularVelocityDegPerHour(periodHours)
  const angularVelocityRadPerSec = calculateAngularVelocityRadPerSec(periodHours)
  const equatorialSpeedKmH = calculateEquatorialSpeedKmH(periodHours)
  const equatorialSpeedMS = calculateEquatorialSpeedMS(periodHours)
  const diurnalPhase = calculateDiurnalPhase(currentAngleRad)

  return {
    speedMultiplier,
    period,
    angularVelocityDegPerHour,
    angularVelocityRadPerSec,
    equatorialSpeedKmH,
    equatorialSpeedMS,
    diurnalPhase,
    axialTiltDeg: AXIAL_TILT_DEG,
  }
}

/**
 * Integrates rotation angle using delta time.
 * Frame-rate independent: ensures identical rotation angular velocity at 30, 60, or 120 FPS.
 *
 * @param currentAngle - Current rotation angle in radians
 * @param speedMultiplier - Speed scale (1.0 = Earth standard)
 * @param deltaSeconds - Elapsed delta time since last frame in seconds
 * @param isPaused - When true, angle remains frozen
 */
export function stepRotationAngle(
  currentAngle: number,
  speedMultiplier: number,
  deltaSeconds: number,
  isPaused: boolean = false
): number {
  if (isPaused || deltaSeconds <= 0) {
    return currentAngle
  }

  // Clamped delta to avoid teleportation if browser tab was suspended
  const clampedDelta = Math.min(deltaSeconds, 0.1)
  const angularStep = VISUAL_BASE_RAD_PER_SEC * speedMultiplier * clampedDelta
  const twoPi = 2 * Math.PI
  return (currentAngle + angularStep) % twoPi
}
