import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_CENTER_Z, PLATFORM_DEPTH, PLATFORM_WIDTH } from './dataCenterConstants';
import { DC_ACCENT_COLOR } from './types';

interface OceanEmbedWakeProps {
  introReveal: number;
}

/** Animated wake rings and caustic pool where the grid meets the digital ocean */
export function OceanEmbedWake({ introReveal }: OceanEmbedWakeProps) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const causticMat = useRef<THREE.MeshBasicMaterial>(null);

  const ringMats = useMemo(
    () =>
      [0.45, 0.32, 0.22].map(
        (base) =>
          new THREE.MeshBasicMaterial({
            color: DC_ACCENT_COLOR,
            transparent: true,
            opacity: base * introReveal,
            toneMapped: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [introReveal],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.25;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.5);

    if (ring1.current) {
      const s = 1 + (t * 0.02) % 1 * 0.35;
      ring1.current.scale.setScalar(s);
      ring1.current.rotation.z = t * 0.05;
    }
    if (ring2.current) {
      const s = 1 + ((t * 0.015 + 0.33) % 1) * 0.4;
      ring2.current.scale.setScalar(s);
      ring2.current.rotation.z = -t * 0.04;
    }
    if (ring3.current) {
      const s = 1 + ((t * 0.012 + 0.66) % 1) * 0.45;
      ring3.current.scale.setScalar(s);
    }

    ringMats.forEach((mat, i) => {
      mat.opacity = [0.14, 0.1, 0.07][i] * introReveal * (0.65 + pulse * 0.35);
    });

    if (causticMat.current) {
      causticMat.current.opacity = (0.12 + pulse * 0.06) * introReveal;
    }
  });

  return (
    <group position={[0, 0.02, GRID_CENTER_Z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} renderOrder={4}>
        <circleGeometry args={[PLATFORM_WIDTH * 0.38, 64]} />
        <meshBasicMaterial
          ref={causticMat}
          color={DC_ACCENT_COLOR}
          transparent
          opacity={0.28 * introReveal}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} renderOrder={3}>
        <ringGeometry args={[PLATFORM_WIDTH * 0.28, PLATFORM_WIDTH * 0.55, 64]} />
        <meshBasicMaterial
          color="#40c8ff"
          transparent
          opacity={0.08 * introReveal}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {[
        { ref: ring1, inner: PLATFORM_WIDTH * 0.32, outer: PLATFORM_WIDTH * 0.38, mat: ringMats[0] },
        { ref: ring2, inner: PLATFORM_WIDTH * 0.4, outer: PLATFORM_WIDTH * 0.48, mat: ringMats[1] },
        { ref: ring3, inner: PLATFORM_WIDTH * 0.52, outer: PLATFORM_WIDTH * 0.62, mat: ringMats[2] },
      ].map(({ ref, inner, outer, mat }, i) => (
        <mesh key={i} ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015 + i * 0.003, 0]} renderOrder={5}>
          <ringGeometry args={[inner, outer, 64]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}

      {Array.from({ length: 12 }).map((_, i) => {
        const t = i / 12;
        const x = (t - 0.5) * PLATFORM_WIDTH * 0.9;
        const z = (Math.sin(t * Math.PI * 2) * 0.5) * PLATFORM_DEPTH * 0.35;
        return (
          <mesh key={i} position={[x, 0.025, z]}>
            <sphereGeometry args={[0.1 + (i % 3) * 0.03, 8, 8]} />
            <meshBasicMaterial
              color="#8aa8c8"
              transparent
              opacity={0.06 * introReveal}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
