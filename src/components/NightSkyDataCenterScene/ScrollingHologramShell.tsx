import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GRID_CENTER_Z,
  PLATFORM_DEPTH,
  RACK_FLOOR_Y,
  RACK_HEIGHT,
  SEGMENT_WIDTH,
} from './dataCenterConstants';
import { segmentLocalX, VISIBLE_SEGMENTS } from './dcCameraPath';

const shellVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shellFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;

  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    float scan = sin(vWorldPos.y * 28.0 - uTime * 2.8) * 0.5 + 0.5;
    float sweep = sin(uTime * 0.7) * 0.5 + 0.5;
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.5);
    float edge = fresnel + smoothstep(0.92, 1.0, abs(vNormal.y)) * 0.4;

    vec3 col = mix(vec3(0.08, 0.35, 0.75), vec3(0.15, 0.55, 0.95), scan);
    float alpha = (0.025 + scan * 0.03 + sweep * 0.01) * edge * uReveal;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

interface ScrollingHologramShellProps {
  introReveal: number;
}

function ShellSegment({ index, uniforms }: { index: number; uniforms: Record<string, THREE.IUniform> }) {
  const facilityTop = RACK_FLOOR_Y + RACK_HEIGHT + 0.5;
  const shellCenterY = facilityTop * 0.5;

  return (
    <group position={[segmentLocalX(index), 0, 0]}>
      <mesh position={[0, shellCenterY, GRID_CENTER_Z]} renderOrder={10}>
        <boxGeometry args={[SEGMENT_WIDTH + 0.4, facilityTop, PLATFORM_DEPTH + 0.4]} />
        <shaderMaterial
          vertexShader={shellVertexShader}
          fragmentShader={shellFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Tiled holographic envelope — repeats with the endless aisle */
export function ScrollingHologramShell({ introReveal }: ScrollingHologramShellProps) {
  const shellUniforms = useMemo(() => ({ uTime: { value: 0 }, uReveal: { value: introReveal } }), [introReveal]);

  useFrame((state) => {
    shellUniforms.uTime.value = state.clock.elapsedTime;
    shellUniforms.uReveal.value = introReveal;
  });

  return (
    <>
      {Array.from({ length: VISIBLE_SEGMENTS }).map((_, i) => (
        <ShellSegment key={i} index={i} uniforms={shellUniforms} />
      ))}
    </>
  );
}
