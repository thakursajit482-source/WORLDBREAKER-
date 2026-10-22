/**
 * Atmosphere Lab Physics & Visual Simulation Helpers
 *
 * NOTE: These calculations utilize an illustrative educational model designed to
 * demonstrate the core principles of Rayleigh and Mie atmospheric scattering,
 * optical depth (Beer-Lambert law), and atmospheric density in real-time 3D.
 * They are simplified for interactive visualization and 60fps rendering,
 * rather than high-order planetary atmospheric solvers.
 */

export type AtmospherePresetId = 'thin' | 'earth' | 'dense'

export interface AtmospherePreset {
  id: AtmospherePresetId
  label: string
  shortName: string
  density: number // Relative atmospheric density (Earth standard = 1.0)
  tag: string
  tagColor: string
  description: string
  opticalNote: string
}

export interface AtmosphereMetrics {
  density: number
  zenithOpticalDepth: number
  limbOpticalDepth: number
  surfaceTransmissionPercent: number
  estimatedPressureKPa: number
  estimatedPressureAtm: number
  regimeName: string
  regimeColor: string
  dominantScattering: string
  hazeLevel: 'Minimal' | 'Moderate' | 'Heavy' | 'Extreme'
}

export interface ShaderVisualConfig {
  haloScale: number
  haloIntensity: number
  haloColorHex: string
  hazeColorHex: string
  surfaceHazeStrength: number
  cloudOpacity: number
  rayleighRatio: number
}

export const ATMOSPHERE_PRESETS: Record<AtmospherePresetId, AtmospherePreset> = {
  thin: {
    id: 'thin',
    label: 'Tenuous / Mars-like',
    shortName: 'Tenuous (0.08×)',
    density: 0.08,
    tag: 'MINIMAL SCATTERING',
    tagColor: '#38bdf8',
    description:
      'Sub-baric, razor-thin atmosphere. Insufficient column density to scatter visible light efficiently. Sky appears pitch-black from the surface and terrain features remain stark and unsoftened.',
    opticalNote:
      'Illustrative educational preset demonstrating sub-baric optical transparency.',
  },
  earth: {
    id: 'earth',
    label: 'Standard / Earth-like',
    shortName: 'Standard (1.00×)',
    density: 1.0,
    tag: 'EQUILIBRIUM RAYLEIGH',
    tagColor: '#55ddf5',
    description:
      'Temperate equilibrium. Ideal column density producing classic Rayleigh blue scattering across the daytime limb, crisp atmospheric halo, and transparent viewing of ground formations.',
    opticalNote:
      'Illustrative educational preset demonstrating balanced terrestrial Rayleigh scattering.',
  },
  dense: {
    id: 'dense',
    label: 'Hyper-Dense / Venusian',
    shortName: 'Hyper-Dense (3.80×)',
    density: 3.8,
    tag: 'MIE HAZE EXTINCTION',
    tagColor: '#fbbf24',
    description:
      'Extreme optical thickness. Multiple scattering and dense aerosol particulate scatter shorter wavelengths away, shifting limb coloration to amber/sulfuric haze and heavily obscuring ground detail.',
    opticalNote:
      'Illustrative educational preset demonstrating high-optical-depth aerosol extinction.',
  },
}

/**
 * Calculates vertical (zenith) optical depth tau_z based on relative atmospheric density.
 * Uses tau_z = rho_rel * 0.22 (standard visible optical depth baseline for Earth).
 */
export function calculateZenithOpticalDepth(density: number): number {
  const clamped = Math.max(0, density)
  return Number((clamped * 0.22).toFixed(3))
}

/**
 * Calculates horizontal/tangential (limb) line-of-sight optical depth.
 * Tangential paths through the atmosphere have an air mass factor of ~7-10x zenith.
 */
export function calculateLimbOpticalDepth(density: number): number {
  const clamped = Math.max(0, density)
  return Number((clamped * 1.65).toFixed(3))
}

/**
 * Calculates surface transmission of direct sunlight via Beer-Lambert Law:
 * T = exp(-tau_z) * 100%
 */
export function calculateTransmission(density: number): number {
  const tau = calculateZenithOpticalDepth(density)
  const transmission = Math.exp(-tau) * 100
  return Number(Math.max(0, Math.min(100, transmission)).toFixed(1))
}

/**
 * Calculates estimated surface atmospheric pressure in kilopascals (kPa).
 * Baseline: 1.0 relative density corresponds to 101.3 kPa (1 standard atmosphere).
 */
export function calculatePressureKPa(density: number): number {
  const clamped = Math.max(0, density)
  return Number((clamped * 101.325).toFixed(1))
}

/**
 * Computes all live physical and educational telemetry metrics for a given density.
 */
export function calculateAtmosphereMetrics(density: number): AtmosphereMetrics {
  const clampedDensity = Math.max(0, Math.min(5.0, Number(density.toFixed(2))))
  const tauZenith = calculateZenithOpticalDepth(clampedDensity)
  const tauLimb = calculateLimbOpticalDepth(clampedDensity)
  const transmission = calculateTransmission(clampedDensity)
  const pressureKPa = calculatePressureKPa(clampedDensity)
  const pressureAtm = Number(clampedDensity.toFixed(2))

  let regimeName = 'Temperate Rayleigh'
  let regimeColor = '#55ddf5'
  let dominantScattering = 'Rayleigh Blue (~450 nm)'
  let hazeLevel: AtmosphereMetrics['hazeLevel'] = 'Moderate'

  if (clampedDensity < 0.25) {
    regimeName = 'Tenuous Exosphere'
    regimeColor = '#94a3b8'
    dominantScattering = 'Negligible (Vacuum / Stark Dark)'
    hazeLevel = 'Minimal'
  } else if (clampedDensity < 0.75) {
    regimeName = 'Sub-Baric Troposphere'
    regimeColor = '#7dd3fc'
    dominantScattering = 'Weak Rayleigh (~440-470 nm)'
    hazeLevel = 'Minimal'
  } else if (clampedDensity <= 1.5) {
    regimeName = 'Terrestrial Equilibrium'
    regimeColor = '#55ddf5'
    dominantScattering = 'Balanced Rayleigh (~450 nm)'
    hazeLevel = 'Moderate'
  } else if (clampedDensity <= 2.8) {
    regimeName = 'Dense Aerosol Troposphere'
    regimeColor = '#c084fc'
    dominantScattering = 'Mixed Rayleigh-Mie / Cyan-Violet'
    hazeLevel = 'Heavy'
  } else {
    regimeName = 'Hyper-Baric Greenhouse'
    regimeColor = '#fbbf24'
    dominantScattering = 'Mie Forward-Scatter / Amber (~580-610 nm)'
    hazeLevel = 'Extreme'
  }

  return {
    density: clampedDensity,
    zenithOpticalDepth: tauZenith,
    limbOpticalDepth: tauLimb,
    surfaceTransmissionPercent: transmission,
    estimatedPressureKPa: pressureKPa,
    estimatedPressureAtm: pressureAtm,
    regimeName,
    regimeColor,
    dominantScattering,
    hazeLevel,
  }
}

/**
 * Calculates shader visual parameters based on atmospheric density.
 * Generates smooth color gradients and halo geometry scalings for Three.js.
 */
export function calculateShaderVisualConfig(density: number): ShaderVisualConfig {
  const d = Math.max(0, Math.min(5.0, density))

  // Halo geometric scale: expands with thicker column density
  // 1.05 (near surface) up to 1.25 (deep expanded exosphere)
  const haloScale = Number((1.05 + Math.min(d, 4.0) * 0.045).toFixed(3))

  // Halo brightness factor
  const haloIntensity = Number(
    Math.min(1.6, 0.2 + Math.pow(Math.min(d, 4.0), 0.75) * 0.5).toFixed(3),
  )

  // Ground haze obscuration strength (Beer-Lambert attenuation for 3D shader)
  const surfaceHazeStrength = Number(
    Math.min(0.85, 0.05 + (1 - Math.exp(-d * 0.55))).toFixed(3),
  )

  // Cloud opacity: thin atmosphere has faint clouds; dense atmosphere has heavy overcast
  const cloudOpacity = Number(
    Math.min(0.95, 0.25 + (1 - Math.exp(-d * 0.8)) * 0.65).toFixed(3),
  )

  // Relative Rayleigh vs Mie scattering ratio
  const rayleighRatio = Number(Math.max(0.1, 1.0 - d * 0.18).toFixed(2))

  // Halo Color interpolation
  // Low density: faint cool violet-cyan
  // 1.0: vibrant bright cyan (#55ddf5 / #00f5ff)
  // High density: warm golden-amber / sulfuric orange (#fbbf24)
  let haloColorHex = '#38bdf8'
  let hazeColorHex = '#0284c7'

  if (d < 0.3) {
    haloColorHex = '#38bdf8'
    hazeColorHex = '#0c4a6e'
  } else if (d <= 1.4) {
    haloColorHex = '#55ddf5'
    hazeColorHex = '#0284c7'
  } else if (d <= 2.6) {
    // Transitioning from cyan to violet/lilac
    haloColorHex = '#a78bfa'
    hazeColorHex = '#6d28d9'
  } else {
    // High density Mie haze: warm golden amber
    haloColorHex = '#fbbf24'
    hazeColorHex = '#b45309'
  }

  return {
    haloScale,
    haloIntensity,
    haloColorHex,
    hazeColorHex,
    surfaceHazeStrength,
    cloudOpacity,
    rayleighRatio,
  }
}
