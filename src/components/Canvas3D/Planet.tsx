import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 3D Simplex noise shader chunk
 * Procedural generation without external texture images for maximum performance and zero network latency.
 */
const noiseGLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Fractional Brownian Motion (3 octaves for sharp continental relief)
float fbm(vec3 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    total += snoise(p) * amplitude;
    p = p * 2.15;
    amplitude *= 0.5;
  }
  return total;
}
`

const planetVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vPosition = position;
  gl_Position = projectionMatrix * mvPosition;
}
`

const planetFragmentShader = `
uniform float uTime;
uniform vec3 uLightDirection;
uniform vec3 uDeepOcean;
uniform vec3 uShallowOcean;
uniform vec3 uLandCoast;
uniform vec3 uLandHighland;
uniform vec3 uSnowPeak;
uniform vec3 uAtmosphereGlow;
uniform vec3 uCityLights;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

${noiseGLSL}

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightDirection);

  // Normalized spherical position coordinates
  vec3 spherePos = normalize(vPosition);

  // Sample terrain noise (slow rotational drift inside shader for organic surface motion)
  float terrain = fbm(spherePos * 2.2 + vec3(0.12, 0.45, 0.78));

  // Polar ice caps calculation based on vertical coordinate
  float polarWeight = smoothstep(0.68, 0.95, abs(spherePos.y));

  // Determine surface color
  vec3 surfaceColor;
  float isWater = 0.0;

  if (terrain < 0.02) {
    // Ocean: interpolate between deep trench blue and shallow cyan shelf
    float oceanDepth = smoothstep(-0.6, 0.02, terrain);
    surfaceColor = mix(uDeepOcean, uShallowOcean, oceanDepth);
    isWater = 1.0;
  } else {
    // Landmass: coast, verdant temperate land, mountain ridge
    float landHeight = smoothstep(0.02, 0.55, terrain);
    surfaceColor = mix(uLandCoast, uLandHighland, landHeight);

    // Mountain snow peaks
    if (terrain > 0.45) {
      float peak = smoothstep(0.45, 0.7, terrain);
      surfaceColor = mix(surfaceColor, uSnowPeak, peak);
    }
  }

  // Blend polar ice sheets over land and sea near poles
  surfaceColor = mix(surfaceColor, uSnowPeak, polarWeight * 0.92);

  // Cloud layer: swirling noise offset by time
  vec3 cloudCoord = spherePos * 2.6 + vec3(uTime * 0.025, uTime * 0.012, 0.0);
  float cloudNoise = fbm(cloudCoord);
  float cloudMask = smoothstep(0.18, 0.65, cloudNoise);
  vec3 cloudColor = vec3(0.96, 0.98, 1.0);

  // Sun lighting calculation (Lambertian diffuse)
  float NdotL = dot(norm, lightDir);
  float dayIntensity = max(0.0, NdotL);

  // Specular glint on ocean surface when hit by sunlight
  vec3 halfVector = normalize(lightDir + viewDir);
  float specular = pow(max(0.0, dot(norm, halfVector)), 32.0) * isWater * 0.75 * step(0.0, NdotL);

  // Composite day surface with clouds
  vec3 litPlanet = mix(surfaceColor, cloudColor, cloudMask * 0.88);
  litPlanet += vec3(specular);

  // Night side: dark space background with subtle bioluminescent city lights and cyan grid clusters
  float nightNoise = snoise(spherePos * 9.0);
  float cityCluster = smoothstep(0.55, 0.75, nightNoise) * (1.0 - isWater) * (1.0 - polarWeight);
  vec3 nightGlow = uCityLights * cityCluster * 1.5;

  // Smooth terminator transition from day to night
  float dayNightMix = smoothstep(-0.15, 0.25, NdotL);
  vec3 finalColor = mix(nightGlow, litPlanet * (dayIntensity + 0.04), dayNightMix);

  // Atmospheric Fresnel edge glow (rich cyan and violet scattering on planetary limb)
  float fresnel = pow(1.0 - max(0.0, dot(norm, viewDir)), 2.8);
  vec3 atmosphericEdge = uAtmosphereGlow * fresnel * 1.35;

  // Add atmosphere tint to lit areas
  finalColor += atmosphericEdge;

  gl_FragColor = vec4(finalColor, 1.0);
}
`

// Atmosphere outer halo shader
const haloVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vPosition = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

const haloFragmentShader = `
uniform vec3 uHaloColor;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  // Soft rim falloff fading towards outer boundary
  float rim = dot(vNormal, viewDir);
  float intensity = pow(max(0.0, 1.0 - rim), 3.2);

  // Subtle breathing pulse in exosphere
  float pulse = 0.95 + 0.05 * sin(uTime * 0.8);

  gl_FragColor = vec4(uHaloColor, intensity * 0.75 * pulse);
}
`

interface PlanetProps {
  pointerOffset?: { x: number; y: number }
}

export function Planet({ pointerOffset = { x: 0, y: 0 } }: PlanetProps) {
  const planetRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const planetMatRef = useRef<THREE.ShaderMaterial>(null)
  const haloMatRef = useRef<THREE.ShaderMaterial>(null)

  // Memoize uniforms to prevent unnecessary object allocations in render loop
  const planetUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightDirection: { value: new THREE.Vector3(1.6, 0.7, 1.1).normalize() },
      uDeepOcean: { value: new THREE.Color('#031026') },
      uShallowOcean: { value: new THREE.Color('#0369a1') },
      uLandCoast: { value: new THREE.Color('#0f766e') },
      uLandHighland: { value: new THREE.Color('#15803d') },
      uSnowPeak: { value: new THREE.Color('#e0f2fe') },
      uAtmosphereGlow: { value: new THREE.Color('#38bdf8') },
      uCityLights: { value: new THREE.Color('#22d3ee') },
    }),
    [],
  )

  const haloUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHaloColor: { value: new THREE.Color('#06b6d4') },
    }),
    [],
  )

  useFrame((_, delta) => {
    // Increment shader time for cloud and atmosphere simulation
    if (planetMatRef.current) {
      planetMatRef.current.uniforms.uTime.value += delta
    }
    if (haloMatRef.current) {
      haloMatRef.current.uniforms.uTime.value += delta
    }

    // Steady, hypnotic axial planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.12

      // Smooth interactive easing responding to pointer or controller offset
      const targetRotX = 0.15 + pointerOffset.y * 0.18
      const targetRotZ = -0.1 + pointerOffset.x * 0.15

      planetRef.current.rotation.x = THREE.MathUtils.lerp(
        planetRef.current.rotation.x,
        targetRotX,
        delta * 2.0,
      )
      planetRef.current.rotation.z = THREE.MathUtils.lerp(
        planetRef.current.rotation.z,
        targetRotZ,
        delta * 2.0,
      )
    }

    if (haloRef.current && planetRef.current) {
      haloRef.current.rotation.x = planetRef.current.rotation.x
      haloRef.current.rotation.z = planetRef.current.rotation.z
    }
  })

  return (
    <group position={[1.4, -0.15, 0]}>
      {/* Primary Procedural Planet Sphere */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[2.45, 64, 64]} />
        <shaderMaterial
          ref={planetMatRef}
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={planetUniforms}
        />
      </mesh>

      {/* Atmospheric Exosphere Halo Glow */}
      <mesh ref={haloRef} scale={[1.16, 1.16, 1.16]}>
        <sphereGeometry args={[2.45, 48, 48]} />
        <shaderMaterial
          ref={haloMatRef}
          vertexShader={haloVertexShader}
          fragmentShader={haloFragmentShader}
          uniforms={haloUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
