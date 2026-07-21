import { useMemo } from 'react';
import type { MeshStandardMaterial } from 'three';
import {
  BADGE_DEPTH,
  ICON_BODY_Y,
  ICON_HEAD_Y,
  ICON_PLATE_Y,
  badgeDiscGeometry,
  badgeRimGeometry,
  createAccentMaterial,
  createBodyMaterial,
  iconBodyGeometry,
  iconHeadGeometry,
  iconPlateGeometry,
} from './personGeometry';

interface PersonFigureProps {
  position?: [number, number, number];
  scale?: number;
  bodyMaterial?: MeshStandardMaterial;
  accentMaterial?: MeshStandardMaterial;
}

/**
 * Floating 3D badge icon:
 * clean medallion with raised person glyph.
 */
export function PersonFigure({
  position = [0, 0, 0],
  scale = 1,
  bodyMaterial,
  accentMaterial,
}: PersonFigureProps) {
  const body = useMemo(() => bodyMaterial ?? createBodyMaterial(), [bodyMaterial]);
  const accent = useMemo(() => accentMaterial ?? createAccentMaterial(), [accentMaterial]);

  return (
    <group position={position} scale={scale}>
      <mesh geometry={badgeDiscGeometry} material={body} />
      <mesh rotation={[Math.PI / 2, 0, 0]} geometry={badgeRimGeometry} material={accent} />
      <group position={[0, 0, BADGE_DEPTH]}>
        <mesh position={[0, ICON_HEAD_Y, 0]} geometry={iconHeadGeometry} material={accent} />
        <mesh
          position={[0, ICON_BODY_Y, 0]}
          scale={[1.05, 0.7, 1.05]}
          geometry={iconBodyGeometry}
          material={accent}
        />
        <mesh position={[0, ICON_PLATE_Y, 0.004]} geometry={iconPlateGeometry} material={accent} />
      </group>
    </group>
  );
}
