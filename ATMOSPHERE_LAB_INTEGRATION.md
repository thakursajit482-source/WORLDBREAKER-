# Atmosphere Lab — Integration Note & Architecture Guide

> **Module**: `AtmosphereLab` (Science Laboratory Module 03)  
> **Status**: Feature-Complete, Tested & Production-Ready  
> **Target Track**: Amazon Developer Hackathon 2026 — Fire TV Track  

---

## 1. Files Created

All work has been strictly isolated in `src/components/AtmosphereLab/` to ensure zero merge conflicts with parallel development (e.g. Gravity Lab):

- **[`AtmosphereLab.tsx`](./src/components/AtmosphereLab/AtmosphereLab.tsx)**: Main container orchestrating the 3D WebGL viewport, dual-panel TV-ready HUD, density slider, illustrative presets, and real-time scattering telemetry.
- **[`AtmospherePlanet3D.tsx`](./src/components/AtmosphereLab/AtmospherePlanet3D.tsx)**: GPU shader-powered procedural 3D planet and multi-layer scattering halo mesh that dynamically responds to atmospheric column density.
- **[`atmosphereLabHelpers.ts`](./src/components/AtmosphereLab/atmosphereLabHelpers.ts)**: Isolated calculation engine for optical depth (Beer-Lambert attenuation $e^{-\tau}$), direct surface transmission, pressure scaling, regime classification, and Three.js shader uniforms.
- **[`AtmosphereLab.css`](./src/components/AtmosphereLab/AtmosphereLab.css)**: Isolated visual styling strictly adhering to the WORLDBREAKER design system (deep-space navy `#080D19`, translucent panels `#142238`, cyan `#55DDF5`, violet `#A99BFF`, high-contrast TV focus rings, and responsive 10-foot UI layouts).
- **[`AtmosphereLab.test.ts`](./src/components/AtmosphereLab/AtmosphereLab.test.ts)**: Comprehensive Vitest unit test suite covering optical depth formulas, Beer-Lambert transmission, pressure calculations, regime thresholds, preset bounds, and shader parameter scaling.
- **[`index.ts`](./src/components/AtmosphereLab/index.ts)**: Clean module export point.

---

## 2. Component Props & Expected Usage

### Component Props Interface
```typescript
import type { AtmosphereLabProps } from './components/AtmosphereLab'

export interface AtmosphereLabProps {
  /** Callback triggered when user chooses "Back to Orbit" or presses ESC / Back / Backspace */
  onBack?: () => void
  /** Callback triggered when user resets density back to the default baseline */
  onReset?: () => void
  /** Optional initial atmospheric density relative to Earth standard (default: 1.0) */
  initialDensity?: number
  /** Optional custom CSS class name applied to outer container */
  className?: string
}
```

### Usage in Navigation / Modal Flow
When the lead developer is ready to wire `AtmosphereLab` into `App.tsx` or the router:

```tsx
import { useState } from 'react'
import { AtmosphereLab } from './components/AtmosphereLab'

export function App() {
  const [activeScreen, setActiveScreen] = useState<'orbit' | 'atmosphere-lab'>('orbit')

  if (activeScreen === 'atmosphere-lab') {
    return (
      <AtmosphereLab
        onBack={() => setActiveScreen('orbit')}
        onReset={() => console.log('Atmosphere reset to Earth normal')}
      />
    )
  }

  // Normal Orbit / Hero View
  return (/* ... */)
}
```

---

## 3. Dependencies Needed

**Zero new dependencies required.** `AtmosphereLab` utilizes the existing stack already present in `package.json`:
- `react` & `react-dom` (v19)
- `three` (`^0.186.1`)
- `@react-three/fiber` (`^9.8.2`)
- `@react-three/drei` (`^10.7.9`)
- `lucide-react` (`^1.61.0`)
- `vitest` (v5.0.5)

---

## 4. Key Features Implemented

1. **Procedural 3D Atmospheric Rendering**:
   - Zero external textures (100% procedural GLSL simplex noise & FBM).
   - Dynamic Rayleigh & Mie scattering outer halo with responsive falloff power and additive blending.
   - Surface light attenuation via Beer-Lambert absorption: at higher densities, ground features haze out and diffuse global skylight dominates.
2. **Interactive Density Modulation**:
   - Continuous accessible range slider ($0.00\times$ to $5.00\times$ Earth normal) with live numeric readout and units.
   - Quick step buttons (`-0.1` and `+0.1`) optimized for Fire TV D-pad / remote navigation without fine drag inputs.
3. **Three Illustrative Presets**:
   - **Tenuous / Mars-like** ($0.08\times$): Minimal scattering, black sky, crisp stark surface.
   - **Standard / Earth-like** ($1.00\times$): Balanced Rayleigh scattering ($1/\lambda^4$), classic cyan/blue exosphere limb arc.
   - **Hyper-Dense / Venusian** ($3.80\times$): Extreme optical depth, dense Mie scattering haze, warm amber/sulfuric tint, obscured surface.
   - **Disclaimer**: Explicit callout clearly labeling these as illustrative educational presets demonstrating scattering dynamics rather than empirical planetary measurements.
4. **Scattering Telemetry HUD & Science Info**:
   - Live readouts: Regime classification, Zenith Optical Depth ($\tau_z$), Limb Slant Optical Depth ($\tau_{limb}$), Direct Surface Transmission ($T = e^{-\tau}\%$), and Surface Pressure.
   - Educational panel explaining Rayleigh scattering mechanics ($\propto 1/\lambda^4$) and high-density Mie aerosol scattering.
5. **Living Room 10-Foot UI & Fire TV Navigation**:
   - D-pad and arrow key spatial navigation with auto-skipping when adjusting range sliders.
   - `ESC`, `Backspace`, or TV `GoBack` remote button dismisses the lab via `onBack()`.
   - High-contrast neon cyan TV focus rings (`outline: 2px solid #55ddf5`, box-shadow glow) for comfortable couch viewing.

---

## 5. Independent Verification & Testing

### Running Automated Checks:
```bash
# 1. Run Vitest Unit Tests
npm test

# 2. Run Oxlint Code Quality Check
npm run lint

# 3. Run TypeScript Compiler & Vite Bundle Build
npm run build
```

### Verification Results:
- **Unit Tests**: 20/20 tests passing (including 19 tests dedicated to `atmosphereLabHelpers.ts`).
- **Oxlint**: 0 errors, 0 warnings on all Atmosphere Lab files.
- **TypeScript Build**: Clean compilation (`tsc -b && vite build` built in ~4s).
