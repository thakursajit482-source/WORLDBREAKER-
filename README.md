# WORLDBREAKER 🪐

> **Amazon Developer Hackathon 2026 — Fire TV Track**  
> *Phase 1: 3D Celestial Core & Orbital Foundation*  
> *"The universe is yours to experiment with."*

---

## 🌌 Project Vision

**WORLDBREAKER** is a premium interactive 3D science exploration platform designed for cinematic living room experiences on Fire TV and desktop browsers. Users explore real-time astrophysics, planetary thermodynamics, and cosmic experimentation through an immersive procedural laboratory.

**Phase 1** establishes the foundation:
- A responsive deep-space environment with dynamic lighting.
- A procedural 3D planet generated via GPU shaders (no heavy textures or image downloads).
- Atmospheric Rayleigh/Mie scattering halo and night-side bio-luminescence.
- Science telemetry HUD with live exoplanet physics metrics.
- High-contrast focus rings and spatial D-pad / keyboard navigation designed for 10-foot TV interactions.

---

## 🛠 Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Styling**: Modern CSS with CSS custom properties, glassmorphism, and accessible TV focus indicators
- **Icons**: Lucide React
- **Testing**: Vitest

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (Tested on Node v24.14.0)
- **npm**: v9.0.0 or later

### Installation

Clone or open the project folder in your terminal, then install dependencies:

```bash
npm install
```

### Running Locally (Development Mode)

Start the local Vite development server with hot module replacement (HMR):

```bash
npm run dev
```

Open your browser to the local address displayed in the terminal (typically `http://localhost:5173/`).

### Production Build

Type-check and compile the optimized production bundle:

```bash
npm run build
```

The production output is placed in the `dist/` directory.

### Previewing the Production Build

To preview the compiled production build locally:

```bash
npm run preview
```

### Running Tests

Execute the unit tests using Vitest:

```bash
npm test
```

---

## 🎮 Fire TV Remote & Keyboard Controls

The interface is engineered for standard 10-foot UI standards, supporting both desktop keyboards and Amazon Fire TV remote controls:

| Control | Action |
| :--- | :--- |
| **▲ / ▼ / ◄ / ►** (D-Pad or Arrow Keys) | Spatially navigate between interactive elements |
| **ENTER / SELECT** | Activate selected button or open modal |
| **ESC / BACK / Backspace** | Dismiss open modal or return to orbit view |
| **Tab / Shift+Tab** | Sequential focus navigation |
| **Pointer / Cursor** | Gentle planetary camera parallax tilt |

---

## 📁 Project Architecture

```
worldbreaker/
├── public/                 # Static public assets
├── src/
│   ├── components/
│   │   ├── Canvas3D/
│   │   │   ├── Planet.tsx           # Procedural GLSL planet with night lights & exosphere halo
│   │   │   ├── StarsBackground.tsx  # Optimized background stars & foreground cosmic dust
│   │   │   └── Scene.tsx            # R3F Canvas setup, camera, and cinematic lighting
│   │   └── UI/
│   │       ├── Header.tsx           # System status, sound toggle, fullscreen controls
│   │       ├── HeroOverlay.tsx      # WORLDBREAKER wordmark, tagline, and CTA buttons
│   │       ├── TelemetryPanel.tsx   # Live planetary science HUD readout
│   │       ├── HowItWorksModal.tsx  # Science and architecture explanation dialog
│   │       ├── LabEntranceModal.tsx # Station console previewing Phase 2 Gravity Lab
│   │       └── TVRemoteGuide.tsx    # D-Pad navigation legend
│   ├── hooks/
│   │   ├── useTVNavigation.ts       # Spatial D-pad & keyboard navigation handler
│   │   └── useSoundEffects.ts       # Procedural Web Audio synthesizer (zero audio assets)
│   ├── styles/
│   │   └── app.css                  # Cyber-space design tokens, focus rings, responsive CSS
│   ├── types/
│   │   ├── index.ts                 # TypeScript types for telemetry & UI state
│   │   └── index.test.ts            # Vitest unit tests for physics telemetry model
│   ├── App.tsx                      # Main application orchestrator
│   ├── index.css                    # Global resets & entry stylesheet
│   └── main.tsx                     # React DOM entry point
├── index.html                       # HTML shell with Google Fonts preloads
├── package.json                     # Dependencies, scripts, and build configuration
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite configuration with chunk splitting
```

---

## ⚡ Performance Optimization

- **Zero Heavy Assets**: The 3D planet uses procedural GLSL math (3D Simplex & Fractional Brownian Motion noise) rather than 4K/8K image textures. This guarantees fast initial load times and smooth 60fps performance even on memory-constrained devices.
- **Particle Budgeting**: Foreground cosmic dust is capped at 60 particles, and background stars use single-draw-call point clouds.
- **Vendor Splitting**: Three.js and React bundles are split into dedicated chunks to optimize browser caching.

---

## ⚠️ Phase 1 Boundary & TV Platform Note

- **Phase 1 Scope**: This phase provides the core 3D scene, responsive home screen, telemetry HUD, modal interactions, and keyboard/D-pad navigation. Laboratory simulation experiments (Gravity Lab, Collision Simulator, Atmosphere Engine) are scheduled for subsequent phases.
- **Fire TV Packaging**: As per project constraints, web app compatibility in a browser is not equivalent to native Fire TV deployment. Android/Fire OS packaging (e.g., via Capacitor or Amazon Web App Starter Kit) will be addressed once the web lab foundation is complete.
