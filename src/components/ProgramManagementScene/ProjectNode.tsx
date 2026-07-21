import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { APPEAR_DURATION, DESPAWN_Y, EXIT_FADE_START } from './constants';
import { createProgramGlass } from './glassMaterials';
import type { NodeShape, ProjectNodeSlot } from './types';

function easeOutCubic(t: number): number {
  const u = 1 - t;
  return 1 - u * u * u;
}

function NodeGeometry({ shape }: { shape: NodeShape }) {
  switch (shape) {
    case 'icosahedron':
      return <icosahedronGeometry args={[1, 0]} />;
    case 'dodecahedron':
      return <dodecahedronGeometry args={[1, 0]} />;
    case 'box':
      return <boxGeometry args={[1.35, 1.35, 1.35]} />;
    default:
      return <octahedronGeometry args={[1, 0]} />;
  }
}

interface ProjectNodeProps {
  slot: ProjectNodeSlot;
}

/** Single glass project node — materializes on the grid, then ascends */
export function ProjectNode({ slot }: ProjectNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glass = useMemo(() => createProgramGlass(slot.status), [slot.status]);
  const baseEmissive = glass.emissiveIntensity;
  const baseOpacity = glass.opacity;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (slot.spawnDelay > 0) {
      groupRef.current.visible = false;
      return;
    }

    slot.appear = Math.min(1, slot.appear + delta / APPEAR_DURATION);
    const enter = easeOutCubic(slot.appear);
    const exit = 1 - THREE.MathUtils.smoothstep(slot.y, EXIT_FADE_START, DESPAWN_Y - 0.5);
    const visibility = enter * exit;

    const swayX = Math.sin(t * 0.55 + slot.phase) * 0.35;
    const swayZ = Math.cos(t * 0.4 + slot.phase) * 0.25;
    const bob = slot.appear >= 1 ? Math.sin(t * 1.1 + slot.phase) * 0.12 : 0;
    const settle = (1 - enter) * 2.4;
    const worldScale = slot.scale * (0.15 + 0.85 * enter);

    groupRef.current.position.set(slot.x + swayX, slot.y + bob - settle, slot.z + swayZ);
    groupRef.current.scale.setScalar(worldScale);
    groupRef.current.rotation.set(
      Math.sin(t * 0.3 + slot.phase) * 0.15,
      slot.yaw + t * slot.spin,
      Math.cos(t * 0.25 + slot.phase) * 0.1,
    );
    groupRef.current.visible = visibility > 0.02;

    glass.opacity = baseOpacity * visibility;
    glass.emissiveIntensity = (baseEmissive + 0.06 * Math.sin(t * 1.5 + slot.phase)) * visibility;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <NodeGeometry shape={slot.shape} />
        <primitive object={glass} attach="material" />
      </mesh>
    </group>
  );
}
