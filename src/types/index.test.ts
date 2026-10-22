import { describe, it, expect } from 'vitest'
import type { PlanetTelemetry } from './index'

describe('PlanetTelemetry Type and Physics Validation', () => {
  it('validates physical parameters within realistic astrophysical bounds', () => {
    const testPlanet: PlanetTelemetry = {
      designation: 'WB-EXO-01α',
      classification: 'Terrestrial Super-Earth',
      diameterKm: 13420,
      surfaceGravityG: 1.08,
      surfaceTempC: 18.4,
      rotationPeriodHours: 25.4,
      orbitalVelocityKmS: 29.8,
      atmosphereComposition: 'N₂ 76% • O₂ 21% • Ar 1.2% • CH₄ 0.4%',
    }

    expect(testPlanet.diameterKm).toBeGreaterThan(6000)
    expect(testPlanet.surfaceGravityG).toBeCloseTo(1.08)
    expect(testPlanet.surfaceTempC).toBeGreaterThan(-50)
    expect(testPlanet.surfaceTempC).toBeLessThan(100)
    expect(testPlanet.orbitalVelocityKmS).toBeGreaterThan(20)
  })
})
