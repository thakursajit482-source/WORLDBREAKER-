import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { calculateShaderVisualConfig } from './atmosphereLabHelpers'

/**
 * 3D Simplex noise shader chunk for procedural procedural terrain and clouds.
 * Operates purely on GPU without downloading heavy image textures.
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
uniform float uAtmosphereDensity;
uniform vec3 uAtmosphereColor;
uniform vec3 uHazeColor;
uniform float uSurfaceHazeStrength;
uniform float uCloudOpacity;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

${noiseGLSL}

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightDirection);

  vec3 spherePos = normalize(vPosition);

  // Procedural continental relief
  float terrain = fbm(spherePos * 2.2 + vec3(0.12, 0.45, 0.78));

  // Polar caps
  float polarWeight = smoothstep(0.68, 0.95, abs(spherePos.y));

  vec3 deepOcean = vec3(0.012, 0.063, 0.15);
  vec3 shallowOcean = vec3(0.012, 0.41, 0.63);
  vec3 landCoast = vec3(0.058, 0.46, 0.43);
  vec3 landHighland = vec3(0.082, 0.5, 0.24);
  vec3 snowPeak = vec3(0.88, 0.95, 1.0);

  vec3 surfaceColor;
  float isWater = 0.0;

  if (terrain < 0.02) {
    float oceanDepth = smoothstep(-0.6, 0.02, terrain);
    surfaceColor = mix(deepOcean, shallowOcean, oceanDepth);
    isWater = 1.0;
  } else {
    float landHeight = smoothstep(0.02, 0.55, terrain);
    surfaceColor = mix(landCoast, landHighland, landHeight);
    if (terrain > 0.45) {
      float peak = smoothstep(0.45, 0.7, terrain);
      surfaceColor = mix(surfaceColor, snowPeak, peak);
    }
  }

  surfaceColor = mix(surfaceColor, snowPeak, polarWeight * 0.92);

  // Cloud layer dynamics modulated by atmospheric density
  vec3 cloudCoord = spherePos * 2.6 + vec3(uTime * 0.02, uTime * 0.01, 0.0);
  float cloudNoise = fbm(cloudCoord);
  float cloudThreshold = mix(0.35, 0.10, clamp(uAtmosphereDensity / 4.0, 0.0, 1.0));
  float cloudMask = smoothstep(cloudThreshold, 0.65, cloudNoise) * uCloudOpacity;
  vec3 cloudColor = vec3(0.96, 0.98, 1.0);

  // Lighting
  float NdotL = dot(norm, lightDir);
  float dayIntensity = max(0.0, NdotL);

  // Specular reflection on water
  vec3 halfVector = normalize(lightDir + viewDir);
  float specular = pow(max(0.0, dot(norm, halfVector)), 32.0) * isWater * 0.7 * step(0.0, NdotL);

  // Composite day surface with clouds
  vec3 litPlanet = mix(surfaceColor, cloudColor, cloudMask * 0.85);
  litPlanet += vec3(specular);

  // Atmospheric scattering attenuation (Beer-Lambert optical depth obscuration)
  // Thicker atmosphere masks ground contrast and imposes overall hazy wash
  litPlanet = mix(litPlanet, uHazeColor, uSurfaceHazeStrength * 0.75);

  // Terminator transition
  float dayNightMix = smoothstep(-0.15, 0.25, NdotL);
  vec3 nightColor = vec3(0.005, 0.008, 0.018);
  vec3 finalColor = mix(nightColor, litPlanet * (dayIntensity + 0.04), dayNightMix);

  // Atmospheric Fresnel limb scattering
  // Scaled by atmospheric density
  float rim = 1.0 - max(0.0, dot(norm, viewDir));
  float fresnelPower = mix(4.0, 2.0, clamp(uAtmosphereDensity / 4.0, 0.0, 1.0));
  float fresnel = pow(rim, fresnelPower);
  
  // Limb scattering glow
  float scatteringFactor = clamp(uAtmosphereDensity * 0.8, 0.05, 2.2);
  vec3 atmosphericEdge = uAtmosphereColor * fresnel * scatteringFactor;

  finalColor += atmosphericEdge;

  gl_FragColor = vec4(finalColor, 1.0);
}
`

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
uniform float uIntensity;
uniform float uAtmosphereDensity;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float rim = dot(vNormal, viewDir);
  
  // Adjust falloff steepness based on atmospheric density
  float falloffPower = mix(5.5, 2.2, clamp(uAtmosphereDensity / 4.0, 0.0, 1.0));
  float intensity = pow(max(0.0, 1.0 - rim), falloffPower);

  // Subtle natural atmospheric shimmer
  float pulse = 0.97 + 0.03 * sin(uTime * 0.9);

  float alpha = intensity * uIntensity * pulse;
  gl_FragColor = vec4(uHaloColor, alpha);
}
`

export interface AtmospherePlanet3DProps {
  density: number
  pointerOffset?: { x: number; y: number }
}

/**
 * 3D Planet & Atmospheric Scattering Mesh
 * Responsive to live atmospheric density adjustments.
 */
export function AtmospherePlanet3D({
  density,
  pointerOffset = { x: 0, y: 0 },
}: AtmospherePlanet3DProps) {
  const planetRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const planetMatRef = useRef<THREE.ShaderMaterial>(null)
  const haloMatRef = useRef<THREE.ShaderMaterial>(null)

  const visualConfig = useMemo(() => calculateShaderVisualConfig(density), [density])

  const planetUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightDirection: { value: new THREE.Vector3(1.7, 0.6, 1.2).normalize() },
      uAtmosphereDensity: { value: 1.0 },
      uAtmosphereColor: { value: new THREE.Color('#55ddf5') },
      uHazeColor: { value: new THREE.Color('#0284c7') },
      uSurfaceHazeStrength: { value: 0.3 },
      uCloudOpacity: { value: 0.8 },
    }),
    [],
  )

  const haloUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHaloColor: { value: new THREE.Color('#55ddf5') },
      uIntensity: { value: 0.8 },
      uAtmosphereDensity: { value: 1.0 },
    }),
    [],
  )

  // Update uniforms when density or visual config changes
  useEffect(() => {
    if (planetMatRef.current) {
      planetMatRef.current.uniforms.uAtmosphereDensity.value = density
      planetMatRef.current.uniforms.uAtmosphereColor.value.set(visualConfig.haloColorHex)
      planetMatRef.current.uniforms.uHazeColor.value.set(visualConfig.hazeColorHex)
      planetMatRef.current.uniforms.uSurfaceHazeStrength.value = visualConfig.surfaceHazeStrength
      planetMatRef.current.uniforms.uCloudOpacity.value = visualConfig.cloudOpacity
    }
    if (haloMatRef.current) {
      haloMatRef.current.uniforms.uHaloColor.value.set(visualConfig.haloColorHex)
      haloMatRef.current.uniforms.uIntensity.value = visualConfig.haloIntensity
      haloMatRef.current.uniforms.uAtmosphereDensity.value = density
    }
    if (haloRef.current) {
      const s = visualConfig.haloScale
      haloRef.current.scale.set(s, s, s)
    }
  }, [density, visualConfig])

  useFrame((_, delta) => {
    if (planetMatRef.current) {
      planetMatRef.current.uniforms.uTime.value += delta
    }
    if (haloMatRef.current) {
      haloMatRef.current.uniforms.uTime.value += delta
    }

    if (planetRef.current) {
      // Steady rotation
      planetRef.current.rotation.y += delta * 0.1

      // Interactive gentle parallax tilt
      const targetRotX = 0.15 + pointerOffset.y * 0.15
      const targetRotZ = -0.08 + pointerOffset.x * 0.12

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
    <group position={[1.1, -0.1, 0]}>
      {/* Planetary Surface Mesh */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[2.35, 48, 48]} />
        <shaderMaterial
          ref={planetMatRef}
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={planetUniforms}
        />
      </mesh>

      {/* Atmospheric Scattering Halo Mesh */}
      <mesh ref={haloRef} scale={[visualConfig.haloScale, visualConfig.haloScale, visualConfig.haloScale]}>
        <sphereGeometry args={[2.35, 40, 40]} />
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
