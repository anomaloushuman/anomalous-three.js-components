import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_LINE_COLOR, GRID_VOID } from './types';
import { GRID_FLOOR_Y } from './gridConstants';
import { getIntroProgress, introOceanMix } from '../NightSkyCloudScene/introState';
import { HORIZON_SKY_RGB } from '../NightSkyCloudScene/sceneConstants';

const GRID_SIZE = 900;
const GRID_Y = GRID_FLOOR_Y;

const gridVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gridFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform vec3 uLineColor;
  uniform vec3 uSkyColor;

  varying vec3 vWorldPosition;
  varying vec2 vUv;

  float gridLine(vec2 p, float cell, float width) {
    vec2 g = abs(fract(p / cell - 0.5) - 0.5);
    vec2 line = smoothstep(width, 0.0, g * cell);
    return max(line.x, line.y);
  }

  void main() {
    vec2 p = vWorldPosition.xz;

    // Dual-scale digital grid — lines at multiples of cell size.
    // Major (12) cell centers (4×4 minor squares) sit at …, -18, -6, 6, 18, …
    float major = gridLine(p, 12.0, 0.08);
    float minor = gridLine(p, 3.0, 0.028);

    // Distance from camera-forward corridor — dissolve into sky fog
    float depth = -vWorldPosition.z;
    float fogFade = smoothstep(55.0, 195.0, depth);
    float radial = length(p);
    float sideFade = smoothstep(220.0, 90.0, radial);

    float pulse = 0.65 + 0.35 * sin((-vWorldPosition.z) * 0.05 - uTime * 0.7 + vWorldPosition.x * 0.015);

    float lines = (major + minor * 0.28) * pulse * sideFade;
    lines *= (1.0 - fogFade);

    vec3 color = mix(uLineColor, uSkyColor, fogFade * 0.85) * lines;

    float alpha = clamp(lines * 1.25, 0.0, 1.0) * uReveal * (1.0 - fogFade * 0.92);
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const underlayFragment = /* glsl */ `
  uniform vec3 uVoidColor;
  uniform vec3 uSkyColor;
  uniform float uReveal;
  varying vec3 vWorldPosition;

  void main() {
    float depth = -vWorldPosition.z;
    // Floor void dissolves into sky toward the horizon
    float fogFade = smoothstep(45.0, 185.0, depth);
    float radial = length(vWorldPosition.xz);
    float sideFade = smoothstep(260.0, 100.0, radial);

    vec3 color = mix(uVoidColor, uSkyColor, fogFade);
    float alpha = (1.0 - fogFade) * sideFade * 0.96 * uReveal;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Vast Tron-style digital floor that fades into the sky fog at the horizon */
export function DigitalGrid() {
  const lineMatRef = useRef<THREE.ShaderMaterial>(null);
  const underMatRef = useRef<THREE.ShaderMaterial>(null);

  const skyColor = useMemo(() => new THREE.Color(...HORIZON_SKY_RGB), []);

  const lineUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uLineColor: { value: new THREE.Color(GRID_LINE_COLOR) },
      uSkyColor: { value: skyColor.clone() },
    }),
    [skyColor],
  );

  const underUniforms = useMemo(
    () => ({
      uVoidColor: { value: new THREE.Color(GRID_VOID) },
      uSkyColor: { value: skyColor.clone() },
      uReveal: { value: 0 },
    }),
    [skyColor],
  );

  useFrame((state) => {
    const reveal = introOceanMix(getIntroProgress());
    if (lineMatRef.current) {
      lineMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      lineMatRef.current.uniforms.uReveal.value = reveal;
    }
    if (underMatRef.current) {
      underMatRef.current.uniforms.uReveal.value = reveal;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GRID_Y - 0.05, -120]} frustumCulled={false}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <shaderMaterial
          ref={underMatRef}
          uniforms={underUniforms}
          vertexShader={gridVertexShader}
          fragmentShader={underlayFragment}
          transparent
          depthWrite
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GRID_Y, -120]} frustumCulled={false}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE, 1, 1]} />
        <shaderMaterial
          ref={lineMatRef}
          uniforms={lineUniforms}
          vertexShader={gridVertexShader}
          fragmentShader={gridFragmentShader}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
