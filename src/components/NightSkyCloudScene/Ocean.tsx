import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  cloudReflectionPositions,
  cloudReflectionScales,
  MAX_CLOUD_REFLECTIONS,
} from './cloudReflectionStore';
import { computeHorizonNdcY, setResolutionFromGl } from './horizonClip';
import {
  FOG_COLOR_RGB,
  HORIZON_SKY_RGB,
  OCEAN_CENTER,
  OCEAN_DEPTH,
  OCEAN_WIDTH,
  OCEAN_Y,
} from './sceneConstants';
import type { ParallaxState } from './types';
import { OCEAN_COLOR_RGB } from './types';
import { introOceanMix, getIntroProgress } from './introState';
import { MOON_DIR } from './Moon';

const oceanVertexShader = /* glsl */ `
  varying vec2 vWorldXZ;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldXZ = worldPos.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const oceanFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uHorizonNdcY;
  uniform vec3 uOceanColor;
  uniform vec3 uMoonDir;
  uniform vec2 uPointerXZ;
  uniform float uRippleStrength;
  uniform vec3 uCloudPositions[${MAX_CLOUD_REFLECTIONS}];
  uniform float uCloudScales[${MAX_CLOUD_REFLECTIONS}];
  uniform int uCloudCount;
  uniform vec2 uOceanHalfSize;
  uniform float uOceanCenterZ;
  uniform float uIntroReveal;

  varying vec2 vWorldXZ;
  varying vec3 vWorldPosition;

  const float GRAVITY = 9.81;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  const vec3 DIGITAL_VOID = vec3(0.002, 0.006, 0.018);
  const vec3 DIGITAL_CYAN = vec3(0.04, 0.48, 0.82);
  const vec3 DIGITAL_GLOW = vec3(0.2, 0.75, 1.0);

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  // Deep-water dispersion: ω = sqrt(g · k)
  float dispersion(float wavelength) {
    float k = 6.28318 / wavelength;
    return sqrt(GRAVITY * k);
  }

  float waveComponent(vec2 xz, vec2 dir, float amplitude, float wavelength, float time, out vec2 gradient) {
    float k = 6.28318 / wavelength;
    float omega = dispersion(wavelength);
    float phase = dot(normalize(dir), xz) * k - time * omega;
    float s = sin(phase);
    float c = cos(phase);
    gradient = normalize(dir) * amplitude * k * c;
    return amplitude * s;
  }

  float pointerRipples(vec2 xz, float time, out vec2 grad) {
    grad = vec2(0.0);
    if (uRippleStrength < 0.01) return 0.0;

    vec2 delta = xz - uPointerXZ;
    float dist = length(delta);
    vec2 radial = dist > 0.001 ? delta / dist : vec2(1.0, 0.0);

    float ring1 = sin(dist * 0.55 - time * 5.0) * exp(-dist * 0.018);
    float ring2 = sin(dist * 0.35 - time * 3.2 + 1.1) * exp(-dist * 0.012) * 0.45;
    float h = (ring1 + ring2) * uRippleStrength * 0.18;

    float dh = (ring1 * 0.55 + ring2 * 0.35) * uRippleStrength * 0.18;
    grad = radial * dh;

    return h;
  }

  float calmOceanHeight(vec2 xz, float time, out vec2 gradient) {
    vec2 g1 = vec2(0.0);
    vec2 g2 = vec2(0.0);
    vec2 g3 = vec2(0.0);
    vec2 g4 = vec2(0.0);
    vec2 g5 = vec2(0.0);
    vec2 gP = vec2(0.0);

    float h = 0.0;
    h += waveComponent(xz, vec2(0.92, 0.38), 0.22, 55.0, time, g1);
    h += waveComponent(xz, vec2(-0.45, 0.89), 0.16, 38.0, time, g2);
    h += waveComponent(xz, vec2(0.15, -0.98), 0.1, 24.0, time, g3);
    h += waveComponent(xz, vec2(0.7, 0.7), 0.06, 14.0, time, g4);
    h += waveComponent(xz, vec2(-0.8, 0.2), 0.035, 8.0, time, g5);
    h += pointerRipples(xz, time, gP);

    gradient = g1 + g2 + g3 + g4 + g5 + gP;
    return h;
  }

  vec3 calmOceanNormal(vec2 xz, float time) {
    vec2 grad = vec2(0.0);
    calmOceanHeight(xz, time, grad);

    float e = 0.25;
    vec2 gX = vec2(0.0);
    vec2 gZ = vec2(0.0);
    calmOceanHeight(xz + vec2(e, 0.0), time, gX);
    calmOceanHeight(xz + vec2(0.0, e), time, gZ);

    vec2 ripple = vec2(
      (noise(xz * 1.8 + time * 0.15) - 0.5) * 0.04,
      (noise(xz * 2.1 + time * 0.12) - 0.5) * 0.04
    );

    return normalize(vec3(-(grad.x + (gX.x - grad.x) / e) + ripple.x, 1.0, -(grad.y + (gZ.y - grad.y) / e) + ripple.y));
  }

  vec3 nightSkyColor(vec3 dir) {
    float h = clamp(dir.y, -0.1, 1.0);
    vec3 zenith = vec3(0.004, 0.008, 0.035);
    vec3 upper = vec3(0.006, 0.014, 0.055);
    vec3 mid = vec3(0.01, 0.024, 0.085);
    vec3 horizon = vec3(0.016, 0.035, 0.11);
    vec3 sky = mix(horizon, mid, smoothstep(-0.05, 0.15, h));
    sky = mix(sky, upper, smoothstep(0.05, 0.5, h));
    sky = mix(sky, zenith, smoothstep(0.3, 0.85, h));
    return sky;
  }

  float starReflection(vec3 reflectDir, float time) {
    if (reflectDir.y < 0.04) return 0.0;

    vec2 uv = reflectDir.xz / (reflectDir.y + 0.08) * 95.0;
    vec2 cell = floor(uv);
    vec2 f = fract(uv) - 0.5;

    float r = hash(cell);
    if (r < 0.9) return 0.0;

    float d = length(f);
    float size = r > 0.975 ? 0.07 : 0.045;
    float core = smoothstep(size, size * 0.25, d);
    float twinkle = 0.55 + 0.45 * sin(time * (1.2 + r * 4.0) + r * 6.28318);
    return core * twinkle * (r > 0.975 ? 1.4 : 0.85);
  }

  float cloudReflectionBlob(vec2 worldXZ, vec2 center, float scale, vec3 normal) {
    vec2 delta = worldXZ - center;
    delta += normal.xz * 1.8;
    delta *= 1.0 / max(scale * 2.8, 1.0);
    float dist = length(delta);
    return exp(-dist * dist * 0.1) * 0.55;
  }

  float animatedBit(vec2 cell, float colFrac, float time) {
    float phase = hash(cell * vec2(1.9, 2.7)) * 6.28318;
    float speed = 0.7 + hash(cell * 2.3) * 1.4;
    float pulse = sin(time * speed + phase) * 0.5 + 0.5;
    pulse = pulse * pulse * (3.0 - 2.0 * pulse);
    float ripple = sin(time * speed * 1.6 + colFrac * 4.5 + phase) * 0.5 + 0.5;
    float bright = mix(pulse, ripple, 0.4);
    return mix(0.08, 0.85, bright);
  }

  float binaryStreams(vec2 worldXZ, float time, float dist, float waveH) {
    float rowSize = mix(0.85, 2.5, smoothstep(25.0, 250.0, dist));
    float colSize = mix(0.28, 0.72, smoothstep(25.0, 250.0, dist));

    float row = worldXZ.y / rowSize + waveH * 0.45;
    float col = worldXZ.x / colSize - time * 0.14 + sin(worldXZ.y * 0.12 - time * 1.7) * 0.08;

    float rowFrac = fract(row);
    float line = exp(-pow((rowFrac - 0.5) * 6.0, 2.0));
    line *= 0.75 + 0.25 * sin(floor(row) * 0.7 + time * 1.6);

    vec2 cell = vec2(floor(col), floor(row));
    float stream = line * animatedBit(cell, fract(col), time);

    float row2 = row * 2.8 - time * 0.05;
    float col2 = col * 2.2 - time * 0.22;
    float line2 = exp(-pow((fract(row2) - 0.5) * 7.0, 2.0));
    float bit2 = animatedBit(vec2(floor(col2), floor(row2)), fract(col2), time * 1.1);
    stream = max(stream, line2 * bit2 * 0.45);

    float flow = sin(col * 1.0 - time * 1.3 + row * 0.5) * 0.5 + 0.5;
    return stream * (0.72 + 0.28 * flow);
  }

  vec3 digitalOceanLayer(vec2 worldXZ, float time, float dist, float waveH, vec3 normal) {
    float binary = binaryStreams(worldXZ, time, dist, waveH);
    float depthFade = smoothstep(15.0, 280.0, dist);

    vec3 base = mix(DIGITAL_VOID, uOceanColor * 0.11, depthFade * 0.5);
    float crest = smoothstep(-0.08, 0.3, waveH);
    base = mix(base, uOceanColor * 0.18, crest * 0.25);

    float bitGlow = binary * (0.32 + crest * 0.35);
    bitGlow *= mix(1.0, 0.4, depthFade);
    float pulse = 0.85 + 0.15 * sin(time * 2.0 + worldXZ.y * 0.1);
    bitGlow *= pulse;

    vec3 digital = base + DIGITAL_CYAN * bitGlow + DIGITAL_GLOW * bitGlow * bitGlow * 0.1;

    vec3 cloudData = vec3(0.0);
    for (int i = 0; i < ${MAX_CLOUD_REFLECTIONS}; i++) {
      if (i >= uCloudCount) break;
      cloudData += vec3(0.15, 0.42, 0.68) * cloudReflectionBlob(
        worldXZ, uCloudPositions[i].xz, uCloudScales[i], normal
      );
    }
    digital += cloudData * binary * 0.18;

    return digital;
  }

  void main() {
    float fragNdcY = (gl_FragCoord.y / uResolution.y) * 2.0 - 1.0;

    vec3 normal = calmOceanNormal(vWorldXZ, uTime);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 reflectDir = reflect(-viewDir, normal);

    vec2 waveGrad = vec2(0.0);
    float waveH = calmOceanHeight(vWorldXZ, uTime, waveGrad);

    float NdotV = max(dot(normal, viewDir), 0.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - NdotV, 5.0);

    float dist = length(vWorldPosition.xz - cameraPosition.xz);
    float depthFade = smoothstep(15.0, 280.0, dist);

    vec3 digital = digitalOceanLayer(vWorldXZ, uTime, dist, waveH, normal);

    vec3 deepWater = uOceanColor * mix(0.14, 0.08, depthFade * 0.6);
    vec3 shallowWater = uOceanColor * mix(0.28, 0.18, depthFade * 0.4);
    vec3 calmSurface = mix(deepWater, shallowWater, pow(NdotV, 0.6));

    vec3 skyRefl = nightSkyColor(reflectDir);
    calmSurface = mix(calmSurface, skyRefl, fresnel * 0.55);

    float stars = starReflection(reflectDir, uTime);
    calmSurface += vec3(0.85, 0.9, 1.0) * stars * fresnel * 0.35;

    vec3 moonDir = normalize(uMoonDir);
    vec3 halfVec = normalize(viewDir + moonDir);
    float NdotH = max(dot(normal, halfVec), 0.0);
    float specPower = 420.0 / (1.0 + length(vWorldXZ - uPointerXZ) * 0.002);
    float moonSpec = pow(NdotH, specPower);
    float moonAlign = max(dot(reflectDir, moonDir), 0.0);
    float moonPath = pow(moonAlign, 24.0) * 0.12;
    float shimmer = 0.75 + 0.25 * noise(vWorldXZ * 0.8 + uTime * 0.2);
    vec3 moonLight = vec3(0.75, 0.82, 0.95);
    calmSurface += moonLight * (moonSpec * 0.45 + moonPath) * shimmer;

    vec3 cloudRefl = vec3(0.0);
    for (int i = 0; i < ${MAX_CLOUD_REFLECTIONS}; i++) {
      if (i >= uCloudCount) break;
      cloudRefl += vec3(0.55, 0.62, 0.72) * cloudReflectionBlob(
        vWorldXZ, uCloudPositions[i].xz, uCloudScales[i], normal
      );
    }
    calmSurface += cloudRefl * fresnel * 0.12;

    float horizonGlow = smoothstep(uHorizonNdcY - 0.02, uHorizonNdcY + 0.08, fragNdcY);
    calmSurface += vec3(0.02, 0.05, 0.12) * horizonGlow * (1.0 - depthFade * 0.5);

    float surfaceMask = fresnel * 0.58 + pow(NdotV, 0.55) * 0.22 + 0.08;
    surfaceMask = clamp(surfaceMask, 0.0, 0.88);

    vec3 water = mix(digital, calmSurface, surfaceMask);

    float distFromCenterX = abs(vWorldXZ.x);
    float distFromCenterZ = abs(vWorldXZ.y - uOceanCenterZ);
    float geomEdgeFade = (1.0 - smoothstep(uOceanHalfSize.x * 0.84, uOceanHalfSize.x * 0.98, distFromCenterX));
    geomEdgeFade *= (1.0 - smoothstep(uOceanHalfSize.y * 0.84, uOceanHalfSize.y * 0.98, distFromCenterZ));

    vec3 horizonSky = vec3(${HORIZON_SKY_RGB.join(', ')});
    float horizonFade = smoothstep(uHorizonNdcY + 0.14, uHorizonNdcY - 0.24, fragNdcY);
    water = mix(horizonSky, water, horizonFade * geomEdgeFade);

    vec3 fogColor = vec3(${FOG_COLOR_RGB.join(', ')});
    float farDist = max(dist - 70.0, 0.0);
    float atmosphericFog = (1.0 - exp(-farDist * 0.0045));
    atmosphericFog *= smoothstep(uHorizonNdcY - 0.07, uHorizonNdcY + 0.02, fragNdcY);
    atmosphericFog *= smoothstep(uHorizonNdcY + 0.12, uHorizonNdcY - 0.02, fragNdcY);
    water = mix(water, fogColor, atmosphericFog * 0.32);

    water = mix(horizonSky, water, uIntroReveal);

    gl_FragColor = vec4(water, 1.0);
  }
`;

function buildUniforms() {
  return {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uHorizonNdcY: { value: 0 },
    uOceanColor: { value: new THREE.Vector3(...OCEAN_COLOR_RGB) },
    uMoonDir: { value: MOON_DIR.clone() },
    uPointerXZ: { value: new THREE.Vector2(0, -200) },
    uRippleStrength: { value: 0 },
    uCloudPositions: {
      value: Array.from({ length: MAX_CLOUD_REFLECTIONS }, () => new THREE.Vector3()),
    },
    uCloudScales: { value: new Float32Array(MAX_CLOUD_REFLECTIONS) },
    uCloudCount: { value: 0 },
    uOceanHalfSize: { value: new THREE.Vector2(OCEAN_WIDTH * 0.5, OCEAN_DEPTH * 0.5) },
    uOceanCenterZ: { value: OCEAN_CENTER[2] },
    uIntroReveal: { value: 1 },
  };
}

const _raycaster = new THREE.Raycaster();
const _oceanPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -OCEAN_Y);
const _hitPoint = new THREE.Vector3();
const _smoothedPointer = new THREE.Vector2(0, -200);

interface OceanProps {
  cloudCount?: number;
  parallax?: ParallaxState | null;
}

export function Ocean({ cloudCount = 8, parallax = null }: OceanProps) {
  const uniforms = useMemo(() => buildUniforms(), []);
  const { camera, gl } = useThree();
  const rippleStrength = useRef(0);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: oceanVertexShader,
        fragmentShader: oceanFragmentShader,
        uniforms,
        depthWrite: true,
        depthTest: true,
      }),
    [uniforms],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    setResolutionFromGl(gl, uniforms.uResolution.value);
    uniforms.uHorizonNdcY.value = computeHorizonNdcY(camera);
    uniforms.uIntroReveal.value = introOceanMix(getIntroProgress());

    if (parallax) {
      _raycaster.setFromCamera(parallax.pointer, camera);
      const hit = _raycaster.ray.intersectPlane(_oceanPlane, _hitPoint);

      if (hit) {
        _smoothedPointer.x = THREE.MathUtils.lerp(_smoothedPointer.x, hit.x, 0.12);
        _smoothedPointer.y = THREE.MathUtils.lerp(_smoothedPointer.y, hit.z, 0.12);
      }

      const speed = parallax.pointerVel.length();
      const targetStrength = Math.min(speed * 3.0, 0.8);
      rippleStrength.current = THREE.MathUtils.lerp(
        rippleStrength.current,
        targetStrength,
        0.08,
      );
      rippleStrength.current *= 0.97;

      uniforms.uPointerXZ.value.copy(_smoothedPointer);
      uniforms.uRippleStrength.value = rippleStrength.current;
    } else {
      uniforms.uRippleStrength.value = THREE.MathUtils.lerp(
        uniforms.uRippleStrength.value,
        0,
        0.08,
      );
    }

    const positions = uniforms.uCloudPositions.value as THREE.Vector3[];
    const scales = uniforms.uCloudScales.value as Float32Array;
    const count = Math.min(cloudCount, MAX_CLOUD_REFLECTIONS);
    for (let i = 0; i < count; i++) {
      positions[i].copy(cloudReflectionPositions[i]);
      scales[i] = cloudReflectionScales[i];
    }
    uniforms.uCloudCount.value = count;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={OCEAN_CENTER}
      renderOrder={2}
    >
      <planeGeometry args={[OCEAN_WIDTH, OCEAN_DEPTH, 1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export { OCEAN_Y };
