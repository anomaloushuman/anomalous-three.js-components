import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_CENTER_Z, PLATFORM_DEPTH, PLATFORM_HEIGHT, PLATFORM_WIDTH } from './dataCenterConstants';
import { DC_ACCENT_COLOR } from './types';

interface FacilityDeckProps {
  introReveal: number;
}

/** Holographic platform deck with pulsing perimeter trim */
export function FacilityDeck({ introReveal }: FacilityDeckProps) {
  const deckMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#142030',
        metalness: 0.92,
        roughness: 0.12,
        transparent: true,
        opacity: 0.62,
        emissive: DC_ACCENT_COLOR,
        emissiveIntensity: 0.05 * introReveal,
      }),
    [introReveal],
  );

  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: DC_ACCENT_COLOR,
        emissive: DC_ACCENT_COLOR,
        emissiveIntensity: 0.2 * introReveal,
        toneMapped: false,
        metalness: 0.95,
        roughness: 0.08,
        transparent: true,
        opacity: 0.85,
      }),
    [introReveal],
  );

  const hw = PLATFORM_WIDTH / 2;
  const hd = PLATFORM_DEPTH / 2;

  useFrame((state) => {
    const pulse = 0.65 + 0.35 * Math.sin(state.clock.elapsedTime * 1.6);
    const flicker = 0.92 + 0.08 * Math.sin(state.clock.elapsedTime * 9.0);
    edgeMat.emissiveIntensity = 0.22 * introReveal * pulse * flicker;
    deckMat.emissiveIntensity = 0.06 * introReveal * pulse;
    deckMat.opacity = 0.58 + 0.06 * Math.sin(state.clock.elapsedTime * 2.2);
  });

  const perimeterSegments: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, PLATFORM_HEIGHT / 2 + 0.012, hd + 0.02], size: [PLATFORM_WIDTH + 0.12, 0.02, 0.04] },
    { pos: [0, PLATFORM_HEIGHT / 2 + 0.012, -hd - 0.02], size: [PLATFORM_WIDTH + 0.12, 0.02, 0.04] },
    { pos: [hw + 0.02, PLATFORM_HEIGHT / 2 + 0.012, 0], size: [0.04, 0.02, PLATFORM_DEPTH + 0.12] },
    { pos: [-hw - 0.02, PLATFORM_HEIGHT / 2 + 0.012, 0], size: [0.04, 0.02, PLATFORM_DEPTH + 0.12] },
  ];

  return (
    <group position={[0, 0, GRID_CENTER_Z]}>
      <mesh position={[0, PLATFORM_HEIGHT / 2, 0]}>
        <boxGeometry args={[PLATFORM_WIDTH, PLATFORM_HEIGHT, PLATFORM_DEPTH]} />
        <primitive object={deckMat} attach="material" />
      </mesh>

      <mesh position={[0, PLATFORM_HEIGHT + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PLATFORM_WIDTH - 0.2, PLATFORM_DEPTH - 0.2]} />
        <meshStandardMaterial
          color="#3080c0"
          emissive={DC_ACCENT_COLOR}
          emissiveIntensity={0.08 * introReveal}
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.25}
          toneMapped={false}
        />
      </mesh>

      {perimeterSegments.map(({ pos, size }, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={size} />
          <primitive object={edgeMat} attach="material" />
        </mesh>
      ))}

      {(
        [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ] as [number, number][]
      ).map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (hw - 0.15), PLATFORM_HEIGHT / 2 + 0.05, sz * (hd - 0.15)]}>
          <boxGeometry args={[0.08, PLATFORM_HEIGHT + 0.1, 0.08]} />
          <meshStandardMaterial
            color="#5090c0"
            emissive={DC_ACCENT_COLOR}
            emissiveIntensity={0.1 * introReveal}
            metalness={0.95}
            roughness={0.1}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
