import type { MissionDefinition } from './types'

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'mission-gravity-01',
    code: 'MSN-GRV-01',
    title: 'Vacuum Fall & Planetary Mass',
    subtitle: 'Kinematics in a 20-Meter Test Chamber',
    labType: 'gravity-lab',
    difficulty: 'cadet',
    estimatedMinutes: 5,
    isAvailable: true,
    statusBadge: 'LAB READY',
    learningObjectives: [
      'Observe that in a vacuum with no air resistance, all objects accelerate at the same rate regardless of mass.',
      'Verify the kinematic relationship between drop height and elapsed time: s = ½gt².',
      'Compare impact velocities across terrestrial, lunar, and Jovian gravity environments.',
    ],
    taskInstructions: [
      'Enter the Gravity Chamber and drop the test sphere from the 20-meter gantry tower under Earth gravity (9.81 m/s²).',
      'Record the elapsed time to floor impact (~2.02 seconds) and the terminal impact velocity (~19.81 m/s).',
      'Optionally test Moon (1.62 m/s²) or Jupiter (24.79 m/s²) to see how surface gravity alters impact physics.',
      'Conclude the experiment to review your Discovery Summary and complete the flight quiz.',
    ],
    briefingText:
      'Welcome to Science Module 01. In 1971, Apollo 15 astronaut David Scott dropped a falcon feather and a hammer simultaneously on the Moon, proving Galileo’s 400-year-old hypothesis that gravity accelerates all matter equally in a vacuum. Your mission is to simulate this phenomenon in our 20-meter vertical drop tower and verify the mathematics of free-fall motion.',
    questions: [
      {
        id: 'grv-q1',
        prompt:
          'In a complete vacuum with zero air resistance, if a 5 kg bowling ball and a 0.01 kg feather are dropped simultaneously from 20 meters, which reaches the floor first?',
        options: [
          'The bowling ball reaches the floor first because it has greater mass and weight.',
          'The feather reaches the floor first because it experiences less inertia.',
          'Both hit the floor at the exact same instant, because gravitational acceleration in a vacuum is independent of mass.',
          'It depends on the atmospheric pressure inside the building.',
        ],
        correctIndex: 2,
        explanation:
          'In a vacuum where aerodynamic drag is absent, gravity accelerates all objects at the identical rate (g). According to Newton’s second law (F = ma) and gravitation (F = G*M*m/r²), the object’s mass cancels out: a = g.',
        scientificLaw: 'Galilean Equivalence Principle (a = g)',
      },
      {
        id: 'grv-q2',
        prompt:
          'If you run the 20-meter drop experiment on Jupiter, where gravity is roughly 24.8 m/s² (about 2.5× Earth), what happens to the drop duration?',
        options: [
          'The sphere takes longer to fall because Jupiter is larger.',
          'The sphere falls faster, taking significantly less time to strike the floor.',
          'The fall time remains identical because the drop height is still 20 meters.',
          'The sphere floats due to Jupiter being a gas giant.',
        ],
        correctIndex: 1,
        explanation:
          'Because impact time is t = √(2h / g), a larger gravitational acceleration g in the denominator produces a shorter fall time. On Jupiter, the sphere reaches the floor in ~1.27 seconds compared to ~2.02 seconds on Earth.',
        scientificLaw: 'Free-Fall Kinematic Formula: t = √(2h / g)',
      },
      {
        id: 'grv-q3',
        prompt:
          'According to the classical kinematic equation s = ½gt², what happens to the distance fallen if the elapsed free-fall time doubles?',
        options: [
          'The distance fallen doubles (2×).',
          'The distance fallen quadruples (4×).',
          'The distance fallen increases by a factor of 8×.',
          'The distance fallen remains constant.',
        ],
        correctIndex: 1,
        explanation:
          'Distance fallen scales with the square of time (t²). Doubling the elapsed time (2t)² results in 4 times the distance fallen (4s).',
        scientificLaw: 'Quadratic Time Scaling: s ∝ t²',
      },
    ],
  },
  {
    id: 'mission-atmosphere-01',
    code: 'MSN-ATM-01',
    title: 'Blue Skies & Optical Depth',
    subtitle: 'Rayleigh Scattering & Beer-Lambert Attenuation',
    labType: 'atmosphere-lab',
    difficulty: 'specialist',
    estimatedMinutes: 6,
    isAvailable: true,
    statusBadge: 'LAB READY',
    learningObjectives: [
      'Understand why planetary skies scatter blue wavelengths much more efficiently than red (Rayleigh scattering ∝ 1/λ⁴).',
      'Observe Beer-Lambert optical extinction (T = e⁻ᵠ) as atmospheric column density increases.',
      'Recognize how hyper-dense atmospheres cause Mie haze and shift limb scattering toward warm amber hues.',
    ],
    taskInstructions: [
      'Enter the Atmospheric Synthesizer and observe the procedural exoplanet under vacuum (0.00× density).',
      'Increase atmospheric density to Earth-normal (1.00×) and observe the vibrant cyan-blue Rayleigh limb arc.',
      'Push density to Hyper-Dense (3.80×) and note how the surface details are obscured by aerosol haze.',
      'Review your scattering telemetry and proceed to the scientific certification quiz.',
    ],
    briefingText:
      'Welcome to Science Module 03. When sunlight encounters gas molecules in a planetary atmosphere, photons interact with electron clouds in a process discovered by Lord Rayleigh. Shorter wavelengths of light (blue and violet) scatter far more intensely than longer red wavelengths. In this mission, you will experiment with column density and observe the transition from crisp vacuum to luminous Rayleigh scattering and dense aerosol extinction.',
    questions: [
      {
        id: 'atm-q1',
        prompt:
          'Why does a clear Earth-like atmosphere scatter short blue wavelengths (~450 nm) far more intensely than long red wavelengths (~700 nm)?',
        options: [
          'Blue photons travel faster than red photons through gas.',
          'Rayleigh scattering efficiency is inversely proportional to the fourth power of wavelength (∝ 1/λ⁴).',
          'Oxygen and nitrogen molecules have a natural chemical blue dye.',
          'Earth’s magnetic field redirects red light toward space.',
        ],
        correctIndex: 1,
        explanation:
          'Rayleigh scattering scales with 1/λ⁴. Because blue light has roughly half the wavelength of deep red light, it scatters approximately (700/450)⁴ ≈ 5.8 times more vigorously in all directions, illuminating the sky in blue.',
        scientificLaw: 'Rayleigh Scattering Law (I ∝ 1/λ⁴)',
      },
      {
        id: 'atm-q2',
        prompt:
          'What does the Beer-Lambert law (T = e⁻ᵠ) predict about direct sunlight reaching the planetary surface as optical depth (τ) increases?',
        options: [
          'Direct transmission drops exponentially, diffusing light into hazy atmospheric skyglow and obscuring surface contrast.',
          'Direct transmission increases linearly because the thicker atmosphere acts as a magnifying lens.',
          'Surface transmission remains 100% regardless of gas thickness.',
          'Light velocity slows down to zero before reaching the ground.',
        ],
        correctIndex: 0,
        explanation:
          'Beer-Lambert attenuation is exponential: T = e⁻ᵠ. As optical depth τ rises from density and aerosol loading, direct unscattered sunlight decays exponentially, hazing out surface topography into diffuse skylight.',
        scientificLaw: 'Beer-Lambert Extinction Law (T = e⁻ᵠ)',
      },
      {
        id: 'atm-q3',
        prompt:
          'If an astronaut stands on the surface of an airless moon or planet with zero atmospheric column density, what color is the sky during midday?',
        options: [
          'Bright cyan-blue like Earth.',
          'Pitch black with clearly visible stars, right next to the blazing sun.',
          'Solid white due to unfiltered solar glare.',
          'Deep orange from planetary reflection.',
        ],
        correctIndex: 1,
        explanation:
          'Without gas molecules or aerosols to scatter photons into the observer’s line of sight, space remains completely black even while the sun shines brilliantly above the horizon.',
        scientificLaw: 'Optical Depth Zero Boundary Condition (τ = 0)',
      },
    ],
  },
  {
    id: 'mission-rotation-01',
    code: 'MSN-ROT-01',
    title: 'Planetary Spin & Diurnal Rhythms',
    subtitle: 'Axial Tilt, Coriolis Dynamics & Day-Night Cycles',
    labType: 'rotation-lab',
    difficulty: 'commander',
    estimatedMinutes: 8,
    isAvailable: false,
    statusBadge: 'COMING IN PHASE 4',
    learningObjectives: [
      'Examine how planetary rotation period dictates diurnal heating cycles.',
      'Observe the Coriolis effect on planetary wind bands.',
    ],
    taskInstructions: [
      'This advanced laboratory chamber is currently undergoing orbital calibration.',
      'Check back in the next mission update.',
    ],
    briefingText:
      'Science Module 04 explores planetary angular momentum, day-night terminators, and rotational weather systems. This module is currently locked in development.',
    questions: [],
  },
]
