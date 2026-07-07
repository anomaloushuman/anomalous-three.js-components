import { useMemo } from 'react';
import * as THREE from 'three';
import { AISLE_WIDTH, GRID_CENTER_Z, PLATFORM_DEPTH, PLATFORM_HEIGHT } from './dataCenterConstants';

interface ScrollingAisleDeckProps {
  introReveal: number;
}

/** Continuous matte deck — no segment edge lines */
export function ScrollingAisleDeck({ introReveal }: ScrollingAisleDeckProps) {
  const deckMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: '#141c28',
        transparent: true,
        opacity: 0.72 * introReveal,
      }),
    [introReveal],
  );

  return (
    <group position={[0, 0, GRID_CENTER_Z]}>
      <mesh position={[0, PLATFORM_HEIGHT / 2, 0]}>
        <boxGeometry args={[AISLE_WIDTH, PLATFORM_HEIGHT, PLATFORM_DEPTH]} />
        <primitive object={deckMat} attach="material" />
      </mesh>
    </group>
  );
}
