import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_FLOOR_Y } from './gridConstants';
import { getIntroProgress, introOceanMix } from '../NightSkyCloudScene/introState';
import { HORIZON_SKY_RGB } from '../NightSkyCloudScene/sceneConstants';

const mistVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Horizon veil — bridges grid floor into the sky background */
const mistFragment = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uOpacity;
  uniform vec3 uColor;

  varying vec3 vWorldPosition;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

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

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amp * noise(p);
      p = p * 2.07 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    float depth = -vWorldPosition.z;
    // Builds toward the horizon so the grid dissolves into sky
    float depthBand = smoothstep(40.0, 120.0, depth) * smoothstep(240.0, 150.0, depth);

    vec2 drift = vec2(uTime * 0.01, -uTime * 0.007);
    float wisp = fbm(vWorldPosition.xz * 0.014 + drift);
    float density = mix(0.55, 1.0, smoothstep(0.25, 0.75, wisp));

    vec2 uv = vUv * 2.0 - 1.0;
    float edge = 1.0 - smoothstep(0.5, 1.05, length(uv * vec2(0.75, 1.05)));

    float alpha = depthBand * density * edge * uOpacity * uReveal;
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface MistSheetProps {
  y: number;
  opacity: number;
  size: number;
  z: number;
}

function MistSheet({ y, opacity, size, z }: MistSheetProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(...HORIZON_SKY_RGB) },
    }),
    [opacity],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uReveal.value = introOceanMix(getIntroProgress());
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, z]} renderOrder={2} frustumCulled={false}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={mistVertex}
        fragmentShader={mistFragment}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.NormalBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Soft sky-colored fog that lets the grid fade into the background. */
export function GridAtmosphere() {
  return (
    <group>
      <MistSheet y={GRID_FLOOR_Y + 0.4} opacity={0.22} size={460} z={-130} />
      <MistSheet y={GRID_FLOOR_Y + 1.6} opacity={0.14} size={420} z={-140} />
      <MistSheet y={GRID_FLOOR_Y + 3.2} opacity={0.08} size={380} z={-150} />
    </group>
  );
}
