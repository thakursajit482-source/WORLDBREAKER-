import { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Planet } from './Planet'
import { StarsBackground } from './StarsBackground'

interface SceneProps {
  className?: string
}

export function Scene({ className = '' }: SceneProps) {
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 })

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    // Normalize to [-1, 1] range with gentle damping
    const x = ((clientX / innerWidth) * 2 - 1) * 0.8
    const y = -((clientY / innerHeight) * 2 - 1) * 0.8
    setPointerOffset({ x, y })
  }, [])

  return (
    <div
      className={`scene-container ${className}`}
      onPointerMove={handlePointerMove}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        dpr={[1, 1.5]} // Performance optimized for high-res screens and TV devices
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
      >
        <color attach="background" args={['#030712']} />

        {/* Cinematic space lighting */}
        <ambientLight color="#1e1b4b" intensity={0.65} />
        <directionalLight position={[6, 3.5, 5]} intensity={1.8} color="#e0f2fe" />
        <directionalLight position={[-6, -2, -3]} intensity={0.9} color="#818cf8" />

        <Suspense fallback={null}>
          <StarsBackground />
          <Planet pointerOffset={pointerOffset} />
        </Suspense>
      </Canvas>
    </div>
  )
}
