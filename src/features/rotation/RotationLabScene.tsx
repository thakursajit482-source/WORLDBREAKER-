import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { StarsBackground } from '../../components/Canvas3D/StarsBackground'
import { RotationPlanet3D } from './RotationPlanet3D'

interface RotationLabSceneProps {
  currentAngle: number
  axialTiltEnabled?: boolean
}

/**
 * Distant Sun visual marker indicating the source of celestial illumination.
 */
function SunMarker({ position = [16, 2.7, 10.7] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Radiant Sun Core */}
      <mesh>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshBasicMaterial color="#fffbeb" />
      </mesh>
      {/* Sun Corona Halo */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

export function RotationLabScene({
  currentAngle,
  axialTiltEnabled = true,
}: RotationLabSceneProps) {
  const sunDirection: [number, number, number] = [6.0, 1.0, 4.0]

  return (
    <div className="wb-rotation-canvas-wrap" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#080D19']} />

        {/* Space illumination */}
        <ambientLight color="#0f172a" intensity={0.4} />

        {/* Primary Sun directional key light */}
        <directionalLight
          position={sunDirection}
          intensity={2.6}
          color="#fffbeb"
        />

        {/* Subtle nightside fill bounce light */}
        <directionalLight
          position={[-6.0, -1.0, -4.0]}
          intensity={0.25}
          color="#38bdf8"
        />

        {/* Distant Sun Sphere */}
        <SunMarker position={[18, 3, 12]} />

        {/* Stars Background */}
        <Suspense fallback={null}>
          <StarsBackground />
          <RotationPlanet3D
            currentAngle={currentAngle}
            axialTiltEnabled={axialTiltEnabled}
            sunDirection={sunDirection}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
