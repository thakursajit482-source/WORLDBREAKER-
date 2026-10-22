import { describe, it, expect } from 'vitest'
import {
  EARTH_ROTATION_PERIOD_HOURS,
  ROTATION_PRESETS,
  MIN_ROTATION_SPEED,
  MAX_ROTATION_SPEED,
  calculateRotationPeriodHours,
  calculateRotationPeriodSeconds,
  formatRotationPeriod,
  calculateAngularVelocityDegPerHour,
  calculateAngularVelocityRadPerSec,
  calculateEquatorialSpeedKmH,
  calculateEquatorialSpeedMS,
  calculateDiurnalPhase,
  calculateAllRotationMetrics,
  stepRotationAngle,
  VISUAL_BASE_RAD_PER_SEC,
} from './rotationPhysics'

describe('Rotation Lab Physics Core', () => {
  describe('Rotation Period & Speed Scaling', () => {
    it('calculates correct period for Earth baseline (1.0x = 24 hours)', () => {
      const periodHours = calculateRotationPeriodHours(1.0)
      expect(periodHours).toBe(24.0)

      const periodSeconds = calculateRotationPeriodSeconds(1.0)
      expect(periodSeconds).toBe(86400)
    })

    it('calculates accurate periods for Slow, Earth-like, and Fast presets', () => {
      const slow = ROTATION_PRESETS.slow
      expect(calculateRotationPeriodHours(slow.speedMultiplier)).toBe(96.0)

      const earth = ROTATION_PRESETS.earth
      expect(calculateRotationPeriodHours(earth.speedMultiplier)).toBe(24.0)

      const fast = ROTATION_PRESETS.fast
      expect(calculateRotationPeriodHours(fast.speedMultiplier)).toBe(10.0)
    })

    it('enforces min and max speed boundary clamps', () => {
      // Speed below min clamps to 0.1x -> 240 hours
      expect(calculateRotationPeriodHours(0.01)).toBe(24.0 / MIN_ROTATION_SPEED)

      // Speed above max clamps to 5.0x -> 4.8 hours
      expect(calculateRotationPeriodHours(100)).toBe(24.0 / MAX_ROTATION_SPEED)
    })
  })

  describe('Unit Conversions Display', () => {
    it('converts periods >= 24 hours to days and hours', () => {
      // 96 hours = 4.0 Earth days
      const converted96 = formatRotationPeriod(96.0)
      expect(converted96.totalDays).toBe(4.0)
      expect(converted96.formattedShort).toBe('4.0 days')
      expect(converted96.formattedDetailed).toContain('4.0 Earth days')

      // 24 hours = 1.0 Earth day
      const converted24 = formatRotationPeriod(24.0)
      expect(converted24.totalDays).toBe(1.0)
      expect(converted24.formattedShort).toBe('1.0 days')
    })

    it('converts periods < 24 hours to hours and minutes', () => {
      // 10.0 hours = 10h 00m
      const converted10 = formatRotationPeriod(10.0)
      expect(converted10.hoursComponent).toBe(10)
      expect(converted10.minutesComponent).toBe(0)
      expect(converted10.formattedDetailed).toContain('10h 00m')

      // 9.5 hours = 9h 30m
      const converted9_5 = formatRotationPeriod(9.5)
      expect(converted9_5.hoursComponent).toBe(9)
      expect(converted9_5.minutesComponent).toBe(30)
      expect(converted9_5.formattedDetailed).toContain('9h 30m')
    })

    it('converts sub-hour periods to minutes and seconds', () => {
      // 0.5 hours = 30 minutes
      const convertedSubHour = formatRotationPeriod(0.5)
      expect(convertedSubHour.formattedShort).toBe('30 min')
      expect(convertedSubHour.totalSeconds).toBe(1800)
    })
  })

  describe('Angular Velocity & Equatorial Linear Speed', () => {
    it('calculates Earth angular rate of 15.0 deg/hour (360° / 24h)', () => {
      const degPerHour = calculateAngularVelocityDegPerHour(EARTH_ROTATION_PERIOD_HOURS)
      expect(degPerHour).toBe(15.0)
    })

    it('calculates angular velocity in rad/s correctly', () => {
      // omega = 2pi / 86400s ≈ 7.2722e-5 rad/s
      const radPerSec = calculateAngularVelocityRadPerSec(24.0)
      expect(radPerSec).toBeCloseTo(7.272e-5, 8)
    })

    it('calculates Earth equatorial linear speed (~1,670 km/h or ~464 m/s)', () => {
      const speedKmH = calculateEquatorialSpeedKmH(24.0)
      expect(speedKmH).toBeCloseTo(1667.9, 0)

      const speedMS = calculateEquatorialSpeedMS(24.0)
      expect(speedMS).toBeCloseTo(463.3, 0)
    })

    it('scales linear speed proportionally with higher rotation rates', () => {
      const speedEarth = calculateEquatorialSpeedKmH(24.0)
      const speedFast = calculateEquatorialSpeedKmH(10.0) // 2.4x speed
      expect(speedFast).toBeCloseTo(speedEarth * 2.4, 0)
    })
  })

  describe('Diurnal Cycle & Solar Time Phasing', () => {
    it('identifies Solar Noon at angle 0', () => {
      const phase = calculateDiurnalPhase(0)
      expect(phase.phaseName).toBe('High Noon / Subsolar')
      expect(phase.solarTime).toBe('12:00 PM')
      expect(phase.percentProgress).toBe(0)
    })

    it('identifies Dusk / Terminator crossing near pi / 2 (90°)', () => {
      const phase = calculateDiurnalPhase(Math.PI / 2)
      expect(phase.phaseName).toBe('Dusk / Terminator Crossing')
      expect(phase.solarTime).toBe('6:00 PM')
      expect(phase.percentProgress).toBeCloseTo(25, 0)
    })

    it('identifies Deep Nightside near pi (180°)', () => {
      const phase = calculateDiurnalPhase(Math.PI)
      expect(phase.phaseName).toBe('Deep Nightside')
      expect(phase.solarTime).toBe('12:00 AM')
      expect(phase.percentProgress).toBeCloseTo(50, 0)
    })

    it('identifies Dawn / Sunrise boundary near 3pi / 2 (270°)', () => {
      const phase = calculateDiurnalPhase((3 * Math.PI) / 2)
      expect(phase.phaseName).toBe('Dawn / Sunrise Boundary')
      expect(phase.solarTime).toBe('6:00 AM')
      expect(phase.percentProgress).toBeCloseTo(75, 0)
    })
  })

  describe('Frame-Rate Independent Delta Time Stepping', () => {
    it('does not advance angle when simulation is paused', () => {
      const initialAngle = 1.25
      const stepped = stepRotationAngle(initialAngle, 1.0, 0.016, true)
      expect(stepped).toBe(initialAngle)
    })

    it('does not advance angle when delta time is zero or negative', () => {
      const initialAngle = 1.25
      expect(stepRotationAngle(initialAngle, 1.0, 0, false)).toBe(initialAngle)
      expect(stepRotationAngle(initialAngle, 1.0, -0.016, false)).toBe(initialAngle)
    })

    it('yields identical total rotation regardless of frame rate (60 FPS vs 30 FPS)', () => {
      let angle60 = 0
      const dt60 = 1 / 60
      // Advance 60 frames at 60 FPS (1.0 second total)
      for (let i = 0; i < 60; i++) {
        angle60 = stepRotationAngle(angle60, 1.0, dt60, false)
      }

      let angle30 = 0
      const dt30 = 1 / 30
      // Advance 30 frames at 30 FPS (1.0 second total)
      for (let i = 0; i < 30; i++) {
        angle30 = stepRotationAngle(angle30, 1.0, dt30, false)
      }

      // Both should yield the exact same accumulated angle: VISUAL_BASE_RAD_PER_SEC * 1.0s
      expect(angle60).toBeCloseTo(VISUAL_BASE_RAD_PER_SEC, 3)
      expect(angle30).toBeCloseTo(VISUAL_BASE_RAD_PER_SEC, 3)
      expect(angle60).toBeCloseTo(angle30, 4)
    })

    it('wraps around 2pi smoothly without discontinuous jumps', () => {
      const nearFullCircle = 2 * Math.PI - 0.01
      const stepped = stepRotationAngle(nearFullCircle, 1.0, 0.1, false)
      expect(stepped).toBeGreaterThanOrEqual(0)
      expect(stepped).toBeLessThan(2 * Math.PI)
    })
  })

  describe('Integrated Metrics Computation', () => {
    it('computes all unified telemetry metrics correctly for default state', () => {
      const metrics = calculateAllRotationMetrics(1.0, 0)
      expect(metrics.speedMultiplier).toBe(1.0)
      expect(metrics.period.totalHours).toBe(24.0)
      expect(metrics.angularVelocityDegPerHour).toBe(15.0)
      expect(metrics.equatorialSpeedKmH).toBeGreaterThan(1600)
      expect(metrics.diurnalPhase.phaseName).toBe('High Noon / Subsolar')
      expect(metrics.axialTiltDeg).toBe(23.44)
    })
  })
})
