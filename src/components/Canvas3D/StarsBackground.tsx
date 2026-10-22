import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

interface CosmicDustProps {
  count?: number
}

/**
 * Foreground cosmic dust particles to provide depth parallax.
 * Limited to ~60 particles to ensure optimal 60fps on Fire TV / budget hardware.
 */
function CosmicDust({ count = 60 }: CosmicDustProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const cyan = new THREE.Color('#38bdf8')
    const violet = new THREE.Color('#c084fc')
    const white = new THREE.Color('#ffffff')

    for (let i = 0; i < count; i++) {
      // Spread across camera view frustum
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 + 1

      // Subtle cyan, violet, and white color mixture
      const choice = Math.random()
      const color = choice < 0.45 ? cyan : choice < 0.75 ? violet : white
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return [pos, col]
  }, [count])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015
      pointsRef.current.rotation.x += delta * 0.008
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export function StarsBackground() {
  return (
    <>
      {/* Distant background star sphere */}
      <Stars
        radius={90}
        depth={40}
        count={2200}
        factor={3.8}
        saturation={0}
        fade
        speed={1}
      />

      {/* Gentle foreground cosmic particles for cinematic depth */}
      <CosmicDust count={60} />
    </>
  )
}
