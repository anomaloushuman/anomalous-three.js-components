import { useMemo } from 'react';
import * as THREE from 'three';
import {
  AISLE_WIDTH,
  GRID_FRONT_Z,
  GRID_ROWS,
  OCEAN_GRID_ROW_SPACING,
} from './dataCenterConstants';
import { DC_ACCENT_COLOR } from './types';

interface OceanGridTiesProps {
  introReveal: number;
}

/** Row markers locked to ocean grid rows beneath the aisle */
export function OceanGridTies({ introReveal }: OceanGridTiesProps) {
  const rowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: DC_ACCENT_COLOR,
        transparent: true,
        opacity: 0.12 * introReveal,
        toneMapped: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [introReveal],
  );

  return (
    <group position={[0, 0.01, 0]}>
      {Array.from({ length: GRID_ROWS }).map((_, row) => (
        <mesh
          key={row}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.002, GRID_FRONT_Z - row * OCEAN_GRID_ROW_SPACING]}
        >
          <planeGeometry args={[AISLE_WIDTH, OCEAN_GRID_ROW_SPACING * 0.05]} />
          <primitive object={rowMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
