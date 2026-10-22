import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { SimulationState } from './physics'

interface GravityLabSceneProps {
  simulationState: SimulationState
}

const BALL_RADIUS = 0.75

/**
 * Floor landing target and concentric reticles.
 */
function ImpactPlatform({ isImpacted }: { isImpacted: boolean }) {
  const shockwaveRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (shockwaveRef.current) {
      if (isImpacted) {
        shockwaveRef.current.visible = true
        const currentScale = shockwaveRef.current.scale.x
        if (currentScale < 4.5) {
          const next = currentScale + delta * 9.0
          shockwaveRef.current.scale.set(next, next, next)
          const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
          mat.opacity = Math.max(0, 1 - currentScale / 4.5)
        }
      } else {
        shockwaveRef.current.visible = false
        shockwaveRef.current.scale.set(0.1, 0.1, 0.1)
      }
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Base Foundation Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <cylinderGeometry args={[5.5, 6.2, 0.2, 32]} />
        <meshStandardMaterial color="#080D19" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Outer Glowing Reticle Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[4.2, 4.35, 48]} />
        <meshBasicMaterial color="#A99BFF" transparent opacity={0.6} />
      </mesh>

      {/* Mid Reticle Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.4, 2.52, 36]} />
        <meshBasicMaterial color="#55DDF5" transparent opacity={0.75} />
      </mesh>

      {/* Center Target Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial
          color="#0e1e38"
          emissive="#55DDF5"
          emissiveIntensity={isImpacted ? 0.9 : 0.25}
          roughness={0.3}
        />
      </mesh>

      {/* Floor Crosshair Indicators */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[7, 0.08]} />
        <meshBasicMaterial color="#55DDF5" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.025, 0]}>
        <planeGeometry args={[7, 0.08]} />
        <meshBasicMaterial color="#55DDF5" transparent opacity={0.35} />
      </mesh>

      {/* Dynamic Impact Shockwave Ring */}
      <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} visible={false}>
        <ringGeometry args={[0.8, 1.15, 32]} />
        <meshBasicMaterial color="#55DDF5" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

/**
 * Vertical Measurement Tower and Height Markers.
 * Spans y = 0 to 20 meters.
 */
function HeightTower() {
  const majorMarkers = useMemo(() => [0, 5, 10, 15, 20], [])
  const minorMarkers = useMemo(
    () => [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19],
    []
  )

  return (
    <group position={[-2.4, 0, 0]}>
      {/* Vertical Main Gantry Truss Column */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 20.6, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Top Release Arm projecting to center (x = 2.4, y = 20) */}
      <mesh position={[1.2, 20.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 2.4, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Top Release Solenoid Clamp */}
      <mesh position={[2.4, 20.15, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
        <meshStandardMaterial color="#0f172a" emissive="#A99BFF" emissiveIntensity={0.4} />
      </mesh>

      {/* Vertical Holographic Laser Guide Beam */}
      <mesh position={[2.4, 10, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 20, 8]} />
        <meshBasicMaterial color="#55DDF5" transparent opacity={0.22} />
      </mesh>

      {/* Minor Height Ticks (every 1 meter) */}
      {minorMarkers.map((m) => (
        <mesh key={`minor-${m}`} position={[0.4, m, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.65} />
        </mesh>
      ))}

      {/* Major Height Ticks with 3D Numbers */}
      {majorMarkers.map((m) => (
        <group key={`major-${m}`} position={[0, m, 0]}>
          {/* Glowing Horizontal Bar */}
          <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshStandardMaterial
              color="#55DDF5"
              emissive="#55DDF5"
              emissiveIntensity={m === 20 ? 0.9 : 0.5}
            />
          </mesh>

          {/* 3D Height Label */}
          <Text
            position={[-0.45, 0, 0]}
            fontSize={0.85}
            color={m === 20 || m === 0 ? '#55DDF5' : '#A99BFF'}
            anchorX="right"
            anchorY="middle"
          >
            {`${m}m`}
          </Text>
        </group>
      ))}
    </group>
  )
}

/**
 * 3D Falling Ball with dynamic floor shadow and sci-fi glowing core.
 */
function FallingBall({ height, isImpacted }: { height: number; isImpacted: boolean }) {
  // Center is clamped such that the bottom touches y = 0
  const ballPosY = Math.max(BALL_RADIUS, height + BALL_RADIUS)

  // Dynamic floor shadow scale & opacity calculation based on distance to ground
  const normalizedDistance = Math.min(1, height / 20)
  const shadowScale = 1.0 + (1 - normalizedDistance) * 0.4
  const shadowOpacity = 0.85 - normalizedDistance * 0.65

  return (
    <group position={[0, 0, 0]}>
      {/* Dynamic Contact Floor Shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        scale={[shadowScale, shadowScale, 1]}
      >
        <circleGeometry args={[BALL_RADIUS * 1.1, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={shadowOpacity} />
      </mesh>

      {/* The 3D Ball */}
      <group position={[0, ballPosY, 0]}>
        {/* Core Sphere */}
        <mesh>
          <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
          <meshStandardMaterial
            color="#0e1726"
            metalness={0.92}
            roughness={0.18}
            emissive={isImpacted ? '#55DDF5' : '#A99BFF'}
            emissiveIntensity={isImpacted ? 0.9 : 0.35}
          />
        </mesh>

        {/* Equatorial Glowing Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BALL_RADIUS * 1.01, 0.04, 16, 32]} />
          <meshBasicMaterial color="#55DDF5" />
        </mesh>

        {/* Meridian Glowing Ring */}
        <mesh>
          <torusGeometry args={[BALL_RADIUS * 1.01, 0.04, 16, 32]} />
          <meshBasicMaterial color="#A99BFF" />
        </mesh>
      </group>
    </group>
  )
}

export function GravityLabScene({ simulationState }: GravityLabSceneProps) {
  const isImpacted = simulationState.status === 'impacted'

  return (
    <div className="wb-gravity-canvas-wrap" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 10.5, 27], fov: 46 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#080D19']} />

        {/* Space lighting */}
        <ambientLight color="#182238" intensity={0.7} />
        <directionalLight position={[10, 24, 15]} intensity={1.9} color="#e0f2fe" />
        <directionalLight position={[-12, 10, -8]} intensity={0.8} color="#A99BFF" />
        <pointLight position={[0, 20, 4]} intensity={1.4} color="#55DDF5" distance={30} />
        <pointLight position={[0, 1, 3]} intensity={isImpacted ? 2.5 : 0.8} color="#55DDF5" distance={15} />

        {/* Background stars */}
        <Stars radius={80} depth={40} count={1800} factor={3.5} saturation={0} fade speed={0.8} />

        {/* 3D Lab World Elements */}
        <HeightTower />
        <ImpactPlatform isImpacted={isImpacted} />
        <FallingBall height={simulationState.height} isImpacted={isImpacted} />
      </Canvas>
    </div>
  )
}
