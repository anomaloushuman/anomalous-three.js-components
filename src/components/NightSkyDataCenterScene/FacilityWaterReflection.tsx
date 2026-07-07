import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GRID_CENTER_Z,
  GRID_COLS_PER_SEGMENT,
  PLATFORM_DEPTH,
  PLATFORM_WIDTH,
  RACK_SPACING_X,
} from './dataCenterConstants';

const reflectionVertexShader = /* glsl */ `
  varying vec2 vLocalXZ;

  void main() {
    vLocalXZ = position.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const reflectionFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;

  varying vec2 vLocalXZ;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 local = vLocalXZ;
    vec2 norm = local / vec2(${(PLATFORM_WIDTH * 0.48).toFixed(2)}, ${(PLATFORM_DEPTH * 0.48).toFixed(2)});

    if (abs(norm.x) > 1.15 || abs(norm.y) > 1.15) discard;

    float edgeFade = (1.0 - smoothstep(0.55, 1.05, max(abs(norm.x), abs(norm.y))));

    // Rack column streaks — mirrored vertical glow
    float colSpacing = ${RACK_SPACING_X.toFixed(2)};
    float cols = float(${GRID_COLS_PER_SEGMENT});
    float streak = 0.0;
    for (float i = 0.0; i < 4.0; i++) {
      float cx = (i - (cols - 1.0) * 0.5) * colSpacing;
      float d = abs(local.x - cx);
      float s = exp(-d * d * 1.8) * (0.55 + 0.45 * sin(uTime * 1.2 + i * 1.7));
      streak += s;
    }
    streak /= cols;

    // Horizontal scan bands (digital mirror)
    float scan = sin(local.y * 3.5 - uTime * 2.0) * 0.5 + 0.5;
    scan *= exp(-abs(norm.y) * 1.2);

    // Data stream shimmer
    float shimmer = hash(floor(local * vec2(4.0, 8.0)) + floor(uTime * 3.0)) * 0.4;

    vec3 color = vec3(0.04, 0.28, 0.58) * streak;
    color += vec3(0.08, 0.42, 0.75) * scan * streak * 0.45;
    color += vec3(0.02, 0.12, 0.28) * shimmer * streak;

    float alpha = edgeFade * (streak * 0.55 + scan * 0.15) * uReveal;
    if (alpha < 0.008) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface FacilityWaterReflectionProps {
  introReveal: number;
}

/** Mirrored rack glow on the ocean surface beneath the facility */
export function FacilityWaterReflection({ introReveal }: FacilityWaterReflectionProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: introReveal },
    }),
    [introReveal],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uReveal.value = introReveal;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, GRID_CENTER_Z]} renderOrder={2}>
      <planeGeometry args={[PLATFORM_WIDTH * 2.4, PLATFORM_DEPTH * 2.4, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={reflectionVertexShader}
        fragmentShader={reflectionFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
