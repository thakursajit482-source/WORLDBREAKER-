# WORLDBREAKER — Learning & Mission Experience Guide

> **Branch**: `learning-missions`  
> **Status**: Feature-Complete, Tested & Production-Ready  
> **Target Track**: Amazon Developer Hackathon 2026 — Fire TV Track  

---

## 1. Architecture Overview

The Learning & Mission Experience provides a structured, gamified educational loop for WORLDBREAKER. Users progress through a 5-stage flight mission:
1. **Mission Briefing (`intro`)**: Outlines the historical and physical context, learning objectives, and task instructions.
2. **Interactive Laboratory Chamber (`lab`)**: Launches the target simulation environment (Gravity Chamber, Atmospheric Synthesizer, etc.) with real-time HUD telemetry capture.
3. **Discovery Summary (`summary`)**: Analyzes actual measurements recorded during the experiment, comparing observed vs. theoretical values ($s = \frac{1}{2}gt^2$, $v = gt$, $T = e^{-\tau}$) with proper scientific units ($m/s^2$, $m/s$, $s$, $kPa$, $\%$).
4. **Science Certification Quiz (`quiz`)**: A short, age-appropriate astrophysics quiz with instant educational feedback and physical law references.
5. **Mission Completion (`completion`)**: Displays overall performance rating, verified learning objectives, experiment highlights, and replay/return controls.

---

## 2. Components & Props Reference

### 2.1 `MissionFlow`
The main mission state machine orchestrating all steps.

```typescript
export interface MissionFlowProps {
  /** Selected mission definition containing objectives, instructions, and quiz data */
  mission: MissionDefinition
  /** Callback to exit mission and return to Mission Operations selector */
  onExitMission: () => void
  /** Procedural audio state */
  soundEnabled: boolean
  /** Toggle procedural Web Audio effects */
  onToggleSound: () => void
  /** Audio feedback callbacks */
  playClick: () => void
  playOpen: () => void
  playImpact: () => void
  /** Optional container class name */
  className?: string
}
```

### 2.2 `MissionIntro`
Displays the pre-flight mission briefing.

```typescript
export interface MissionIntroProps {
  mission: MissionDefinition
  onLaunchLab: () => void
  onBackToMissions?: () => void
  className?: string
}
```

### 2.3 `DiscoverySummary`
Renders experimental results with units, theoretical comparison, and handles loading/empty/error states.

```typescript
export interface DiscoverySummaryProps {
  /** Telemetry object captured directly from simulation chamber */
  discoveryData: ExperimentDiscoveryData | null | undefined
  /** Loading state indicator while compiling telemetry packet */
  isLoading?: boolean
  /** Error message if sensor communication fails */
  error?: string | null
  /** Callback to advance to the science certification quiz */
  onProceedToQuiz?: () => void
  /** Callback to return to the lab and gather more data */
  onRerunExperiment?: () => void
  /** Callback to return to briefing */
  onBackToIntro?: () => void
  className?: string
}
```

### 2.4 `MissionQuiz`
Interactive multiple-choice quiz with immediate scientific answer explanations.

```typescript
export interface MissionQuizProps {
  questions: QuizQuestion[]
  onCompleteQuiz: (result: QuizResult) => void
  onExitQuiz?: () => void
  className?: string
}
```

### 2.5 `MissionCompletion`
Final mission debrief displaying honors rank, quiz score, verified objectives, and options to replay or return.

```typescript
export interface MissionCompletionProps {
  mission: MissionDefinition
  quizResult: QuizResult
  discoveryData?: ExperimentDiscoveryData | null
  onReplayMission: () => void
  onReturnToSelector: () => void
  className?: string
}
```

### 2.6 `MissionSelectView`
Browse and select available flight missions.

```typescript
export interface MissionSelectViewProps {
  onSelectMission: (mission: MissionDefinition) => void
  onBackToLabSelect: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
}
```

---

## 3. Integration Steps for Each Lab

### 3.1 Gravity Lab (`gravity-lab`)
- **Hook / View**: `GravityLabView.tsx`
- **Telemetry Payload**:
  - `Drop Height`: `state.initialHeight` ($20\text{ m}$)
  - `Surface Gravity`: `state.gravity` ($m/s^2$)
  - `Elapsed Free-Fall Time`: `state.elapsedTime` ($s$)
  - `Impact Velocity`: `state.velocity` ($m/s$)
- **Connection**: Pass `missionMode={true}` and `onCompleteExperiment={(data) => ...}` to `GravityLabView`. In mission mode, a prominent `"LOG TELEMETRY"` button is displayed in the header to conclude the test and transfer data into `DiscoverySummary`.

### 3.2 Atmosphere Lab (`atmosphere-lab`)
- **Hook / View**: `AtmosphereLab.tsx`
- **Telemetry Payload**:
  - `Column Density`: `density` ($\times\text{ Earth}$)
  - `Zenith Optical Depth`: `metrics.zenithOpticalDepth` ($\tau_z = \rho \times 0.22$)
  - `Limb Optical Depth`: `metrics.limbOpticalDepth` ($\tau_{limb} = \rho \times 1.65$)
  - `Surface Transmission`: `metrics.surfaceTransmissionPercent` ($T = e^{-\tau_z}\%$)
  - `Surface Pressure`: `metrics.estimatedPressureKPa` ($kPa$)
- **Connection**: Pass `missionMode={true}` and `onCompleteExperiment={(data) => ...}` to `AtmosphereLab`. A `"LOG TELEMETRY"` button allows the user to transmit current atmospheric metrics directly to the mission review.

### 3.3 Rotation Lab (`rotation-lab`) / Future Modules
- **Status**: Scheduled for upcoming development phase.
- **Graceful Handling**: `MissionFlow` and `MissionSelectView` detect unavailable modules (`isAvailable: false`) and display clear, accessible calibration messages with a return button, avoiding crashes or broken navigation.

---

## 4. Verification & Testing

### Automated Checks Run:
1. **Unit & Integration Tests**:
   ```bash
   npm test
   ```
   - **Result**: 44/44 tests passed across 4 test suites:
     - `src/features/missions/missions.test.ts` (15 tests: scoring, feedback, validation, deviation)
     - `src/components/AtmosphereLab/AtmosphereLab.test.ts` (19 tests)
     - `src/features/gravity/physics.test.ts` (9 tests)
     - `src/types/index.test.ts` (1 test)
2. **Linter & Code Quality**:
   ```bash
   npm run lint
   ```
   - **Result**: 0 errors, 0 warnings across all mission files.
3. **Production Build**:
   ```bash
   npm run build
   ```
   - **Result**: `tsc -b && vite build` succeeded with clean chunks generated in 5.52s.
