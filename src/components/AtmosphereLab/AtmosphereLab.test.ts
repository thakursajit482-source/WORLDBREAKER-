import { describe, it, expect } from 'vitest'
import {
  ATMOSPHERE_PRESETS,
  calculateZenithOpticalDepth,
  calculateLimbOpticalDepth,
  calculateTransmission,
  calculatePressureKPa,
  calculateAtmosphereMetrics,
  calculateShaderVisualConfig,
} from './atmosphereLabHelpers'

describe('Atmosphere Lab - Physics & Simulation Helpers', () => {
  describe('Optical Depth Calculations (Beer-Lambert model)', () => {
    it('calculates zenith optical depth accurately for standard Earth baseline', () => {
      const earthTau = calculateZenithOpticalDepth(1.0)
      expect(earthTau).toBe(0.22)
    })

    it('returns zero optical depth for a vacuum / zero density atmosphere', () => {
      expect(calculateZenithOpticalDepth(0)).toBe(0)
      expect(calculateZenithOpticalDepth(-1)).toBe(0) // Clamps negative
    })

    it('calculates higher optical depth for denser atmospheres', () => {
      const thinTau = calculateZenithOpticalDepth(0.08)
      const denseTau = calculateZenithOpticalDepth(3.8)
      expect(denseTau).toBeGreaterThan(thinTau)
      expect(denseTau).toBeCloseTo(0.836, 2)
    })

    it('verifies limb optical depth is significantly greater than zenith due to slant airmass', () => {
      const zenith = calculateZenithOpticalDepth(1.0)
      const limb = calculateLimbOpticalDepth(1.0)
      expect(limb).toBeGreaterThan(zenith * 5)
    })
  })

  describe('Light Transmission (Direct Sunlight)', () => {
    it('delivers 100% surface transmission in total vacuum (density 0)', () => {
      expect(calculateTransmission(0)).toBe(100.0)
    })

    it('attenuates transmission realistically for standard Earth atmosphere', () => {
      const earthTrans = calculateTransmission(1.0)
      // exp(-0.22) * 100 ~ 80.25%
      expect(earthTrans).toBeGreaterThan(79.0)
      expect(earthTrans).toBeLessThan(82.0)
    })

    it('exhibits monotonic attenuation as density increases', () => {
      const transThin = calculateTransmission(0.08)
      const transEarth = calculateTransmission(1.0)
      const transDense = calculateTransmission(3.8)

      expect(transThin).toBeGreaterThan(transEarth)
      expect(transEarth).toBeGreaterThan(transDense)
      expect(transDense).toBeGreaterThan(0)
    })
  })

  describe('Surface Pressure Estimation', () => {
    it('estimates 101.3 kPa for Earth normal density (1.0)', () => {
      expect(calculatePressureKPa(1.0)).toBeCloseTo(101.3, 1)
    })

    it('scales linearly with atmospheric column density', () => {
      expect(calculatePressureKPa(2.0)).toBeCloseTo(202.65, 0)
      expect(calculatePressureKPa(0)).toBe(0)
    })
  })

  describe('Atmosphere Metrics & Regimes', () => {
    it('correctly classifies tenuous vacuum regime', () => {
      const metrics = calculateAtmosphereMetrics(0.08)
      expect(metrics.regimeName).toBe('Tenuous Exosphere')
      expect(metrics.hazeLevel).toBe('Minimal')
    })

    it('correctly classifies terrestrial Rayleigh regime', () => {
      const metrics = calculateAtmosphereMetrics(1.0)
      expect(metrics.regimeName).toBe('Terrestrial Equilibrium')
      expect(metrics.hazeLevel).toBe('Moderate')
      expect(metrics.dominantScattering).toContain('Rayleigh')
    })

    it('correctly classifies hyper-baric Mie scattering regime', () => {
      const metrics = calculateAtmosphereMetrics(3.8)
      expect(metrics.regimeName).toBe('Hyper-Baric Greenhouse')
      expect(metrics.hazeLevel).toBe('Extreme')
      expect(metrics.dominantScattering).toContain('Amber')
    })

    it('clamps extreme density inputs within safety bounds [0, 5.0]', () => {
      const underflow = calculateAtmosphereMetrics(-2)
      expect(underflow.density).toBe(0)

      const overflow = calculateAtmosphereMetrics(10)
      expect(overflow.density).toBe(5.0)
    })
  })

  describe('Illustrative Presets Specification', () => {
    it('provides exactly three clearly labelled educational presets', () => {
      const presetKeys = Object.keys(ATMOSPHERE_PRESETS)
      expect(presetKeys).toEqual(['thin', 'earth', 'dense'])
    })

    it('clearly labels all presets as illustrative educational models', () => {
      Object.values(ATMOSPHERE_PRESETS).forEach((preset) => {
        expect(preset.opticalNote.toLowerCase()).toContain('illustrative educational preset')
        expect(preset.label.length).toBeGreaterThan(0)
        expect(preset.description.length).toBeGreaterThan(20)
        expect(preset.density).toBeGreaterThanOrEqual(0)
      })
    })

    it('maintains correct relative density hierarchy among presets', () => {
      expect(ATMOSPHERE_PRESETS.thin.density).toBeLessThan(ATMOSPHERE_PRESETS.earth.density)
      expect(ATMOSPHERE_PRESETS.earth.density).toBeLessThan(ATMOSPHERE_PRESETS.dense.density)
    })
  })

  describe('3D Shader Visual Configuration', () => {
    it('expands outer halo scale as density increases', () => {
      const thinConfig = calculateShaderVisualConfig(0.08)
      const earthConfig = calculateShaderVisualConfig(1.0)
      const denseConfig = calculateShaderVisualConfig(3.8)

      expect(thinConfig.haloScale).toBeLessThan(earthConfig.haloScale)
      expect(earthConfig.haloScale).toBeLessThan(denseConfig.haloScale)
    })

    it('increases ground haze attenuation factor with density', () => {
      const thinConfig = calculateShaderVisualConfig(0.08)
      const denseConfig = calculateShaderVisualConfig(3.8)

      expect(denseConfig.surfaceHazeStrength).toBeGreaterThan(thinConfig.surfaceHazeStrength)
    })

    it('transitions halo hue to warm amber at hyper-dense levels', () => {
      const earthConfig = calculateShaderVisualConfig(1.0)
      const denseConfig = calculateShaderVisualConfig(3.8)

      expect(earthConfig.haloColorHex).toBe('#55ddf5')
      expect(denseConfig.haloColorHex).toBe('#fbbf24')
    })
  })
})
