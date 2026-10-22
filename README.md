# WORLDBREAKER 🪐

> **Amazon Developer Hackathon 2026 — Fire TV Track**  
> *Phase 1: 3D Celestial Core & Orbital Foundation*  
> *Phase 2: Gravity Lab & Celestial Kinematics*  
> *"The universe is yours to experiment with."*

---

## 🌌 Project Vision

**WORLDBREAKER** is a premium interactive 3D science exploration platform designed for cinematic living room experiences on Fire TV and desktop browsers. Users explore real-time astrophysics, planetary thermodynamics, and cosmic experimentation through an immersive procedural laboratory.

### Phase 1 & 2 Completed Features
- **Cinematic Orbit View**: Procedural 3D planet with multi-octave Fractional Brownian Motion (FBM) shader, ocean specular reflections, polar ice caps, swirling cloud cover, night-side city luminescence, and atmospheric Rayleigh/Mie scattering halo.
- **Experiment Selector**: Clean laboratory chamber selector allowing users to choose active modules while communicating future roadmap milestones.
- **Module 01: Gravity Lab**:
  - Immersive 3D drop tower spanning 0m to 20m with vertical gantry, guide laser, and glowing height markers (0m, 5m, 10m, 15m, 20m).
  - Landing impact platform with target reticles and dynamic ground shockwave on impact.
  - Visible sphere with dynamic floor shadow scaling by altitude.
  - Classical free-fall kinematics: $s = \frac{1}{2}gt^2$ and $v = gt$.
  - Fixed simulation timestep (120Hz) keeping physics calculation strictly decoupled from rendering frame rate.
  - Gravity presets: **Earth** ($9.81\text{ m/s}^2$), **Moon** ($1.62\text{ m/s}^2$), and **Jupiter** ($24.79\text{ m/s}^2$).
  - Continuous gravity slider from $1.0\text{ m/s}^2$ to $25.0\text{ m/s}^2$.
  - Full simulation controls: **DROP**, **PAUSE**, **RESUME**, and **RESET**.
  - Live telemetry HUD displaying elapsed time, remaining height, instantaneous velocity, selected gravity, altitude trajectory percentage, and theoretical benchmarks.
  - Clamps ball at floor ($h = 0$) and halts simulation at impact.
  - 10-foot Fire TV remote and keyboard navigation with high-contrast cyan/violet focus states.

---

## 🛠 Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Styling**: Modern CSS with CSS custom properties, glassmorphism, and accessible TV focus indicators
- **Theme Palette**: WORLDBREAKER Deep Navy (`#080D19`), Cyan (`#55DDF5`), and Violet (`#A99BFF`)
- **Audio**: Web Audio API procedural synthesizer (zero audio assets)
- **Icons**: Lucide React
- **Testing**: Vitest

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (Tested on Node v24.14.0)
- **npm**: v9.0.0 or later

### Installation

Install dependencies:

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
| **▲ / ▼ / ◄ / ►** (D-Pad or Arrow Keys) | Spatially navigate between interactive buttons & presets |
| **◄ / ► on Slider** | Fine-tune gravitational acceleration ($1 - 25\text{ m/s}^2$) |
| **ENTER / Space / SELECT** | Activate selected button, start/pause/reset simulation |
| **ESC / BACK / Backspace** | Return to previous screen (Gravity Lab $\to$ Selector $\to$ Orbit View) or close modal |
| **Tab / Shift+Tab** | Sequential focus navigation |
| **Pointer / Cursor** | Gentle camera parallax tilt in 3D views |

---

## 📁 Project Architecture

```
worldbreaker/
├── public/
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
│   │       ├── LabSelectionView.tsx # Experiment chamber selection screen
│   │       └── TVRemoteGuide.tsx    # D-Pad navigation legend
│   ├── features/
│   │   └── gravity/
│   │       ├── physics.ts              # Classical mechanics equations, presets & fixed-timestep stepper
│   │       ├── physics.test.ts         # Vitest unit test suite (kinematics, impact times, floor clamping)
│   │       ├── useGravitySimulation.ts # React hook for deterministic simulation state
│   │       ├── GravityLabScene.tsx     # 3D 20m drop tower, height markers, landing floor & ball
│   │       ├── GravityControls.tsx     # Presets (Earth, Moon, Jupiter), slider & DROP/PAUSE/RESUME/RESET
│   │       ├── GravityTelemetry.tsx    # Live elapsed time, height, velocity, gravity & altitude progress
│   │       └── GravityLabView.tsx      # Main Gravity Lab orchestrator
│   ├── hooks/
│   │   ├── useTVNavigation.ts       # Spatial D-pad, keyboard, and screen-level Back navigation
│   │   └── useSoundEffects.ts       # Procedural Web Audio synthesizer (click, open, impact chimes)
│   ├── styles/
│   │   └── app.css                  # Deep-space theme (#55DDF5, #A99BFF, #080D19), TV focus rings
│   ├── types/
│   │   ├── index.ts                 # TypeScript types for telemetry, modals, and screen state
│   │   └── index.test.ts            # Physics telemetry model test
│   ├── App.tsx                      # View router (home -> lab-select -> gravity-lab)
│   ├── index.css                    # Entry stylesheet
│   └── main.tsx                     # React DOM entry point
├── index.html                       # HTML shell with Google Fonts preloads
├── package.json                     # Dependencies, scripts, and build configuration
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite configuration with chunk splitting
```

---

## 🔬 Physics Verification

The simulation accurately evaluates classical free-fall kinematics from rest:
- Distance fallen: $s(t) = \frac{1}{2}gt^2$
- Velocity: $v(t) = gt$
- Remaining height: $h(t) = \max(0, h_0 - s(t))$
- Impact time: $t_{\text{impact}} = \sqrt{\frac{2h_0}{g}}$
- Impact velocity: $v_{\text{impact}} = \sqrt{2gh_0}$

Benchmarked from $h_0 = 20\text{ m}$:
- **Earth** ($g = 9.81\text{ m/s}^2$): $t_{\text{impact}} \approx 2.02\text{ s}$, $v_{\text{impact}} \approx 19.81\text{ m/s}$
- **Moon** ($g = 1.62\text{ m/s}^2$): $t_{\text{impact}} \approx 4.97\text{ s}$, $v_{\text{impact}} \approx 8.05\text{ m/s}$
- **Jupiter** ($g = 24.79\text{ m/s}^2$): $t_{\text{impact}} \approx 1.27\text{ s}$, $v_{\text{impact}} \approx 31.49\text{ m/s}$
