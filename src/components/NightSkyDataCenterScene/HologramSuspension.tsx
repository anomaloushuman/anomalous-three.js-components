import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_CENTER_Z, PLATFORM_DEPTH, PLATFORM_WIDTH, RACK_FLOOR_Y, RACK_HEIGHT } from './dataCenterConstants';

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
    float alpha = (0.04 + scan * 0.05 + sweep * 0.02) * edge * uReveal;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

interface HologramSuspensionProps {
  introReveal: number;
}

/** Subtle holographic envelope around the facility */
export function HologramSuspension({ introReveal }: HologramSuspensionProps) {
  const shellMat = useRef<THREE.ShaderMaterial>(null);
  const facilityTop = RACK_FLOOR_Y + RACK_HEIGHT + 0.5;
  const shellCenterY = facilityTop * 0.5;

  const shellUniforms = useMemo(() => ({ uTime: { value: 0 }, uReveal: { value: introReveal } }), [introReveal]);

  useFrame((state) => {
    if (!shellMat.current) return;
    shellMat.current.uniforms.uTime.value = state.clock.elapsedTime;
    shellMat.current.uniforms.uReveal.value = introReveal;
  });

  return (
    <mesh position={[0, shellCenterY, GRID_CENTER_Z]} renderOrder={10}>
      <boxGeometry args={[PLATFORM_WIDTH + 0.6, facilityTop, PLATFORM_DEPTH + 0.5]} />
      <shaderMaterial
        ref={shellMat}
        vertexShader={shellVertexShader}
        fragmentShader={shellFragmentShader}
        uniforms={shellUniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
