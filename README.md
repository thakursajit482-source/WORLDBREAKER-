# WORLDBREAKER 🪐

> **Amazon Developer Hackathon 2026 — Fire TV Track**  
> *Phase 1: 3D Celestial Core & Orbital Foundation*  
> *Phase 2: Gravity Lab & Celestial Kinematics*  
> *Phase 3: Atmosphere Lab & Scattering Optics*  
> *Phase 4: Rotation Lab & Diurnal Kinematics*  
> *"The universe is yours to experiment with."*

---

## 🌌 Project Vision

**WORLDBREAKER** is a premium interactive 3D science exploration platform designed for cinematic living room experiences on Fire TV and desktop browsers. Users explore real-time astrophysics, planetary thermodynamics, and cosmic experimentation through an immersive procedural laboratory.

### Available Laboratories

#### 🪐 Module 01: Gravity Lab
- Immersive 3D drop tower spanning 0m to 20m with vertical gantry, guide laser, and glowing height markers (0m, 5m, 10m, 15m, 20m).
- Landing impact platform with target reticles and dynamic ground shockwave on impact.
- Visible sphere with dynamic floor shadow scaling by altitude.
- Classical free-fall kinematics: $s = \frac{1}{2}gt^2$ and $v = gt$.
- Fixed simulation timestep (120Hz) keeping physics calculation strictly decoupled from rendering frame rate.
- Gravity presets: **Earth** ($9.81\text{ m/s}^2$), **Moon** ($1.62\text{ m/s}^2$), and **Jupiter** ($24.79\text{ m/s}^2$).
- Continuous gravity slider from $1.0\text{ m/s}^2$ to $25.0\text{ m/s}^2$.
- Full simulation controls: **DROP**, **PAUSE**, **RESUME**, and **RESET**.

#### 🧭 Module 02: Rotation Lab (Phase 4)
- Interactive 3D rotating planetary sphere rendered with GPU procedural shaders.
- Distinct **Day/Night Terminator line** with dynamic twilight scattering (amber/golden glow along the terminator boundary).
- Dayside surface specular highlights on oceans, polar ice sheets, drifting clouds, and dark nightside with bioluminescent city lights.
- Rotation presets: **Slow / Venusian Drift** ($0.25\times$ / $96\text{h}$ period), **Standard / Earth-like** ($1.00\times$ / $24\text{h}$ period), and **Rapid / Jovian Spin** ($2.40\times$ / $10\text{h}$ period).
- Continuous rotation speed slider ($0.10\times$ to $5.00\times$) with D-pad step buttons and live numerical readout.
- Live rotation period display with multi-unit conversions (hours, Earth days, minutes, seconds).
- Live astrophysical telemetry: Angular velocity in $^\circ/\text{hr}$ and $\text{rad/s}$, equatorial surface velocity in $\text{km/h}$ and $\text{m/s}$, and local solar time ($12\text{h}$ day/night cycle progress).
- Axial obliquity toggle ($23.44^\circ$ tilt) illustrating seasonal daylight variation.
- Simulation controls: **PAUSE**, **RESUME**, **RESET**, and **SCIENCE GUIDE**.
- Educational explanations of the day/night terminator, angular vs. linear velocity, Coriolis shear, and tidal locking.

#### ☁️ Module 03: Atmosphere Lab (Phase 3)
- Real-time atmospheric optical depth ($\tau$) and Beer-Lambert direct sunlight attenuation ($T = e^{-\tau}\%$).
- Rayleigh scattering limb glow and high-density Mie aerosol haze transitions.
- Interactive column density modulation ($0.00\times$ to $5.00\times$).
- Presets for Tenuous (Mars-like), Standard (Earth-like), and Hyper-Dense (Venusian) atmospheres.

---

## 🛠 Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Styling**: Modern CSS with CSS custom properties, glassmorphism, and accessible TV focus indicators
- **Theme Palette**: WORLDBREAKER Deep Navy (`#080D19`), Cyan (`#55DDF5`), and Violet (`#A99BFF`)
- **Audio**: Web Audio API procedural synthesizer (zero external audio files)
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

Open your browser to `http://localhost:5173/`.

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

Execute the unit test suite across all modules using Vitest:

```bash
npm test
```

---

## 🎮 Fire TV Remote & Keyboard Controls

The interface is engineered for standard 10-foot UI standards, supporting both desktop keyboards and Amazon Fire TV remote controls:

| Control | Action |
| :--- | :--- |
| **▲ / ▼ / ◄ / ►** (D-Pad or Arrow Keys) | Spatially navigate between interactive buttons, cards, & presets |
| **◄ / ► on Slider** | Fine-tune rotation speed ($0.10\times - 5.00\times$) or gravity |
| **ENTER / Space / SELECT** | Activate selected button, toggle pause/resume, or open modules |
| **ESC / BACK / Backspace** | Return to previous screen (Lab $\to$ Selector $\to$ Orbit View) or close modal |
| **Tab / Shift+Tab** | Sequential focus navigation |
| **Pointer / Cursor** | Gentle camera parallax tilt in 3D views |

---

## 📁 Project Architecture

```
worldbreaker/
├── public/
├── src/
│   ├── components/
│   │   ├── AtmosphereLab/           # Phase 3: Atmospheric column density & scattering lab
│   │   ├── Canvas3D/
│   │   │   ├── Planet.tsx           # Procedural GLSL planet with night lights & exosphere halo
│   │   │   ├── StarsBackground.tsx  # Optimized background stars & foreground cosmic dust
│   │   │   └── Scene.tsx            # R3F Canvas setup, camera, and cinematic lighting
│   │   └── UI/
│   │       ├── Header.tsx           # System status, sound toggle, fullscreen controls
│   │       ├── HeroOverlay.tsx      # WORLDBREAKER wordmark, tagline, and CTA buttons
│   │       ├── TelemetryPanel.tsx   # Live planetary science HUD readout
│   │       ├── HowItWorksModal.tsx  # Science and architecture explanation dialog
│   │       ├── LabSelectionView.tsx # 4-Module experiment chamber selector
│   │       └── TVRemoteGuide.tsx    # D-Pad navigation legend
│   ├── features/
│   │   ├── gravity/                 # Phase 2: Free fall gravity drop tower & kinematics
│   │   └── rotation/                # Phase 4: Planetary rotation & day/night terminator lab
│   │       ├── rotationPhysics.ts         # Pure kinematics equations, unit conversions, delta-time stepper
│   │       ├── rotationPhysics.test.ts    # Vitest unit test suite (19 tests)
│   │       ├── useRotationSimulation.ts   # Delta-time simulation hook
│   │       ├── RotationPlanet3D.tsx       # 3D planet with day/night terminator GLSL shader & obliquity
│   │       ├── RotationLabScene.tsx       # Three.js canvas with Sun directional light & SunMarker
│   │       ├── RotationControls.tsx       # Presets (Slow, Earth, Fast), slider, pause/resume, reset
│   │       ├── RotationTelemetry.tsx      # Diurnal telemetry, period conversions, angular/linear speed
│   │       ├── RotationEducationModal.tsx # Science modal (Terminator, Coriolis effect, tidal locking)
│   │       ├── RotationLabView.tsx        # Main Rotation Lab view orchestrator
│   │       └── index.ts                   # Module barrel export
│   ├── hooks/
│   │   ├── useTVNavigation.ts       # Spatial D-pad, keyboard, and screen-level Back navigation
│   │   └── useSoundEffects.ts       # Procedural Web Audio synthesizer (clicks, hums, impacts)
│   ├── styles/
│   │   └── app.css                  # Deep-space theme (#55DDF5, #A99BFF, #080D19), TV focus rings
│   ├── types/
│   │   ├── index.ts                 # TypeScript types for telemetry, modals, and screen state
│   │   └── index.test.ts            # Physics telemetry model test
│   ├── App.tsx                      # View router (home -> lab-select -> gravity/rotation/atmosphere)
│   ├── index.css                    # Entry stylesheet
│   └── main.tsx                     # React DOM entry point
├── index.html                       # HTML shell with Google Fonts preloads
├── package.json                     # Dependencies, scripts, and build configuration
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite configuration with chunk splitting
```
