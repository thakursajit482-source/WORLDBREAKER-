import { describe, it, expect } from 'vitest'
import {
  INITIAL_HEIGHT,
  DEFAULT_GRAVITY,
  GRAVITY_PRESETS,
  calculateImpactTime,
  calculateImpactVelocity,
  calculateFreeFall,
  stepPhysics,
  createInitialSimulationState,
  type SimulationState,
} from './physics'

describe('Gravity Lab Physics Core', () => {
  describe('Theoretical Calculations', () => {
    it('calculates accurate impact times for Earth, Moon, and Jupiter presets from 20m', () => {
      const earthPreset = GRAVITY_PRESETS.find((p) => p.id === 'earth')!
      const moonPreset = GRAVITY_PRESETS.find((p) => p.id === 'moon')!
      const jupiterPreset = GRAVITY_PRESETS.find((p) => p.id === 'jupiter')!

      // Earth: t = sqrt(2 * 20 / 9.81) ≈ 2.0187 s
      const tEarth = calculateImpactTime(INITIAL_HEIGHT, earthPreset.value)
      expect(tEarth).toBeCloseTo(2.019, 3)

      // Moon: t = sqrt(2 * 20 / 1.62) ≈ 4.9690 s
      const tMoon = calculateImpactTime(INITIAL_HEIGHT, moonPreset.value)
      expect(tMoon).toBeCloseTo(4.969, 3)

      // Jupiter: t = sqrt(2 * 20 / 24.79) ≈ 1.2702 s
      const tJupiter = calculateImpactTime(INITIAL_HEIGHT, jupiterPreset.value)
      expect(tJupiter).toBeCloseTo(1.270, 3)
    })

    it('calculates accurate theoretical impact velocities (v = sqrt(2 * g * h0))', () => {
      // Earth: v = sqrt(2 * 9.81 * 20) = sqrt(392.4) ≈ 19.809 m/s
      const vEarth = calculateImpactVelocity(INITIAL_HEIGHT, DEFAULT_GRAVITY)
      expect(vEarth).toBeCloseTo(19.809, 3)

      // Moon: v = sqrt(2 * 1.62 * 20) = sqrt(64.8) ≈ 8.050 m/s
      const vMoon = calculateImpactVelocity(INITIAL_HEIGHT, 1.62)
      expect(vMoon).toBeCloseTo(8.050, 3)

      // Jupiter: v = sqrt(2 * 24.79 * 20) = sqrt(991.6) ≈ 31.490 m/s
      const vJupiter = calculateImpactVelocity(INITIAL_HEIGHT, 24.79)
      expect(vJupiter).toBeCloseTo(31.490, 3)
    })
  })

  describe('Free Fall Kinematics (s = 0.5 * g * t², v = g * t)', () => {
    it('returns zero motion at t = 0', () => {
      const result = calculateFreeFall(20, 9.81, 0)
      expect(result.distanceFallen).toBe(0)
      expect(result.remainingHeight).toBe(20)
      expect(result.velocity).toBe(0)
      expect(result.isImpacted).toBe(false)
    })

    it('calculates correct distance and velocity at intermediate time t = 1.0s under Earth gravity', () => {
      // At t = 1s: s = 0.5 * 9.81 * 1² = 4.905m, h = 20 - 4.905 = 15.095m, v = 9.81 * 1 = 9.81 m/s
      const result = calculateFreeFall(20, 9.81, 1.0)
      expect(result.distanceFallen).toBeCloseTo(4.905, 3)
      expect(result.remainingHeight).toBeCloseTo(15.095, 3)
      expect(result.velocity).toBeCloseTo(9.81, 3)
      expect(result.isImpacted).toBe(false)
    })

    it('clamps remaining height to 0 and stops at impact when elapsed time exceeds impact time', () => {
      const tImpact = calculateImpactTime(20, 9.81) // ~2.019s
      const beyondImpact = tImpact + 0.5 // 2.519s

      const result = calculateFreeFall(20, 9.81, beyondImpact)
      expect(result.remainingHeight).toBe(0)
      expect(result.distanceFallen).toBe(20)
      expect(result.isImpacted).toBe(true)
      expect(result.velocity).toBeCloseTo(calculateImpactVelocity(20, 9.81), 3)
    })
  })

  describe('Simulation Stepping & State Machine', () => {
    it('does not advance simulation when status is idle or paused', () => {
      const initial = createInitialSimulationState(9.81, 20)
      expect(initial.status).toBe('idle')

      const steppedIdle = stepPhysics(initial, 0.016)
      expect(steppedIdle.elapsedTime).toBe(0)
      expect(steppedIdle.height).toBe(20)

      const paused = { ...initial, status: 'paused' as const, elapsedTime: 0.5, height: 18 }
      const steppedPaused = stepPhysics(paused, 0.016)
      expect(steppedPaused.elapsedTime).toBe(0.5)
      expect(steppedPaused.height).toBe(18)
    })

    it('advances elapsed time and updates kinematics when running', () => {
      const state: SimulationState = { ...createInitialSimulationState(9.81, 20), status: 'running' }
      const dt = 0.1 // 100ms
      const stepped = stepPhysics(state, dt)

      expect(stepped.status).toBe('running')
      expect(stepped.elapsedTime).toBeCloseTo(0.1, 4)
      expect(stepped.height).toBeLessThan(20)
      expect(stepped.velocity).toBeGreaterThan(0)
    })

    it('transitions to impacted state and clamps at floor without overshooting', () => {
      let state: SimulationState = { ...createInitialSimulationState(9.81, 20), status: 'running' }
      const dt = 1 / 60 // 60fps fixed timestep (~0.01667s)

      // Step until impact occurs
      for (let i = 0; i < 200; i++) {
        state = stepPhysics(state, dt)
        if (state.status === 'impacted') break
      }

      expect(state.status).toBe('impacted')
      expect(state.height).toBe(0)
      expect(state.distanceFallen).toBe(20)
      expect(state.elapsedTime).toBeCloseTo(calculateImpactTime(20, 9.81), 3)
      expect(state.velocity).toBeCloseTo(calculateImpactVelocity(20, 9.81), 3)
    })

    it('resets correctly to initial conditions with custom gravity', () => {
      const state = createInitialSimulationState(1.62, 20)
      expect(state.gravity).toBe(1.62)
      expect(state.height).toBe(20)
      expect(state.velocity).toBe(0)
      expect(state.elapsedTime).toBe(0)
      expect(state.status).toBe('idle')
      expect(state.theoreticalImpactTime).toBeCloseTo(calculateImpactTime(20, 1.62), 3)
    })
  })
})
