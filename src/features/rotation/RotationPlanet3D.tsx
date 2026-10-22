import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AXIAL_TILT_RAD } from './rotationPhysics'

/**
 * 3D Simplex noise shader chunk for procedural terrain, oceans, and clouds.
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
varying vec3 vWorldNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vPosition = position;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vec4 mvPosition = viewMatrix * worldPos;
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

const planetFragmentShader = `
uniform float uTime;
uniform vec3 uSunDirection;
uniform vec3 uDeepOcean;
uniform vec3 uShallowOcean;
uniform vec3 uLandCoast;
uniform vec3 uLandHighland;
uniform vec3 uSnowPeak;
uniform vec3 uAtmosphereGlow;
uniform vec3 uCityLights;
uniform vec3 uTerminatorColor;

varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

${noiseGLSL}

void main() {
  vec3 norm = normalize(vNormal);
  vec3 worldNorm = normalize(vWorldNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 sunDir = normalize(uSunDirection);

  // Position in model space (rotates with planet)
  vec3 spherePos = normalize(vPosition);

  // Procedural continental landmasses
  float terrain = fbm(spherePos * 2.2 + vec3(0.12, 0.45, 0.78));

  // Polar ice caps
  float polarWeight = smoothstep(0.68, 0.95, abs(spherePos.y));

  vec3 surfaceColor;
  float isWater = 0.0;

  if (terrain < 0.02) {
    // Ocean
    float oceanDepth = smoothstep(-0.6, 0.02, terrain);
    surfaceColor = mix(uDeepOcean, uShallowOcean, oceanDepth);
    isWater = 1.0;
  } else {
    // Landmass
    float landHeight = smoothstep(0.02, 0.55, terrain);
    surfaceColor = mix(uLandCoast, uLandHighland, landHeight);

    if (terrain > 0.45) {
      float peak = smoothstep(0.45, 0.7, terrain);
      surfaceColor = mix(surfaceColor, uSnowPeak, peak);
    }
  }

  // Polar snow overlay
  surfaceColor = mix(surfaceColor, uSnowPeak, polarWeight * 0.92);

  // Clouds drifting across the rotating surface
  vec3 cloudCoord = spherePos * 2.6 + vec3(uTime * 0.02, uTime * 0.01, 0.0);
  float cloudNoise = fbm(cloudCoord);
  float cloudMask = smoothstep(0.2, 0.65, cloudNoise);
  vec3 cloudColor = vec3(0.96, 0.98, 1.0);

  // =========================================================================
  // DAY / NIGHT TERMINATOR LIGHTING
  // =========================================================================
  // Dot product of world normal and fixed Sun direction
  float NdotL = dot(worldNorm, sunDir);
  float dayIntensity = max(0.0, NdotL);

  // Ocean specular reflection towards viewer
  vec3 halfVector = normalize(sunDir + viewDir);
  float specular = pow(max(0.0, dot(norm, halfVector)), 32.0) * isWater * 0.8 * step(0.0, NdotL);

  // Composite lit planet with clouds
  vec3 litPlanet = mix(surfaceColor, cloudColor, cloudMask * 0.85);
  litPlanet += vec3(specular);

  // Night-side bioluminescent city lights
  float nightNoise = snoise(spherePos * 9.0);
  float cityCluster = smoothstep(0.55, 0.75, nightNoise) * (1.0 - isWater) * (1.0 - polarWeight);
  vec3 nightGlow = uCityLights * cityCluster * 1.6;

  // Day/Night terminator transition
  // Smoothstep across [-0.15, 0.25] defines the twilight zone
  float dayNightMix = smoothstep(-0.15, 0.25, NdotL);
  vec3 blendedSurface = mix(nightGlow, litPlanet * (dayIntensity + 0.04), dayNightMix);

  // Golden / Amber sunset-sunrise glow along the active terminator band
  float terminatorBand = smoothstep(-0.25, 0.0, NdotL) * (1.0 - smoothstep(0.0, 0.25, NdotL));
  vec3 twilightGlow = uTerminatorColor * terminatorBand * 1.35;
  blendedSurface += twilightGlow;

  // Atmospheric limb glow (Fresnel scattering)
  float fresnel = pow(1.0 - max(0.0, dot(norm, viewDir)), 2.8);
  // Higher atmospheric glow on the sunlit limb
  float sunFacingLimb = max(0.2, dot(worldNorm, sunDir) * 0.5 + 0.5);
  vec3 atmosphericEdge = uAtmosphereGlow * fresnel * 1.4 * sunFacingLimb;

  blendedSurface += atmosphericEdge;

  gl_FragColor = vec4(blendedSurface, 1.0);
}
`

const haloVertexShader = `
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vPosition = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

const haloFragmentShader = `
uniform vec3 uHaloColor;
uniform vec3 uSunDirection;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float rim = dot(vNormal, viewDir);
  float intensity = pow(max(0.0, 1.0 - rim), 3.2);

  // Brighter halo on the day hemisphere
  vec3 sunDir = normalize(uSunDirection);
  float sunFactor = max(0.25, dot(normalize(vWorldNormal), sunDir) * 0.5 + 0.5);

  float pulse = 0.95 + 0.05 * sin(uTime * 0.7);

  gl_FragColor = vec4(uHaloColor, intensity * 0.85 * sunFactor * pulse);
}
`

interface RotationPlanet3DProps {
  currentAngle: number
  axialTiltEnabled?: boolean
  sunDirection?: [number, number, number]
}

export function RotationPlanet3D({
  currentAngle,
  axialTiltEnabled = true,
  sunDirection = [6.0, 1.0, 4.0],
}: RotationPlanet3DProps) {
  const planetMeshRef = useRef<THREE.Mesh>(null)
  const planetMatRef = useRef<THREE.ShaderMaterial>(null)
  const haloMatRef = useRef<THREE.ShaderMaterial>(null)

  const sunDirVector = useMemo(
    () => new THREE.Vector3(...sunDirection).normalize(),
    [sunDirection]
  )

  const planetUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDirection: { value: sunDirVector },
      uDeepOcean: { value: new THREE.Color('#031026') },
      uShallowOcean: { value: new THREE.Color('#0369a1') },
      uLandCoast: { value: new THREE.Color('#0f766e') },
      uLandHighland: { value: new THREE.Color('#15803d') },
      uSnowPeak: { value: new THREE.Color('#e0f2fe') },
      uAtmosphereGlow: { value: new THREE.Color('#55ddf5') },
      uCityLights: { value: new THREE.Color('#38bdf8') },
      uTerminatorColor: { value: new THREE.Color('#fbbf24') }, // Amber twilight
    }),
    [sunDirVector]
  )

  const haloUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDirection: { value: sunDirVector },
      uHaloColor: { value: new THREE.Color('#55ddf5') },
    }),
    [sunDirVector]
  )

  useFrame((_, delta) => {
    if (planetMatRef.current) {
      planetMatRef.current.uniforms.uTime.value += delta
      planetMatRef.current.uniforms.uSunDirection.value.copy(sunDirVector)
    }
    if (haloMatRef.current) {
      haloMatRef.current.uniforms.uTime.value += delta
      haloMatRef.current.uniforms.uSunDirection.value.copy(sunDirVector)
    }

    // Apply the exact delta-time integrated rotation angle to the rotating body
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y = currentAngle
    }
  })

  // 23.44° Earth-like axial obliquity along Z axis
  const tiltAngleZ = axialTiltEnabled ? -AXIAL_TILT_RAD : 0

  return (
    <group position={[0, 0, 0]}>
      {/* Planetary Body Group with Axial Obliquity */}
      <group rotation={[0, 0, tiltAngleZ]}>
        {/* Rotating Planet Sphere */}
        <mesh ref={planetMeshRef}>
          <sphereGeometry args={[2.55, 64, 64]} />
          <shaderMaterial
            ref={planetMatRef}
            vertexShader={planetVertexShader}
            fragmentShader={planetFragmentShader}
            uniforms={planetUniforms}
          />
        </mesh>

        {/* Atmospheric Exosphere Halo Mesh */}
        <mesh scale={[1.15, 1.15, 1.15]}>
          <sphereGeometry args={[2.55, 48, 48]} />
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

        {/* Visual Rotation Axis Line & Polar Markers */}
        <group>
          {/* North-South Gantry Laser Axis */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 6.8, 8]} />
            <meshBasicMaterial color="#55ddf5" transparent opacity={0.65} />
          </mesh>

          {/* North Pole Marker */}
          <mesh position={[0, 3.45, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#55ddf5" />
          </mesh>

          {/* South Pole Marker */}
          <mesh position={[0, -3.45, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#a99bff" />
          </mesh>
        </group>
      </group>
    </group>
  )
}
