import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ChessPiece } from './ChessPiece';
import { createGlassMaterial } from './chessModels';
import type { PersonSlot } from './types';
import { APPEAR_DURATION, DESPAWN_Y, EXIT_FADE_START } from './ascendConstants';

interface FloatingPersonProps {
  slot: PersonSlot;
}

function easeOutCubic(t: number): number {
  const u = 1 - t;
  return 1 - u * u * u;
}

/** Single glass chess piece — materializes onto the grid, then ascends */
export function FloatingPerson({ slot }: FloatingPersonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glassMaterial = useMemo(() => createGlassMaterial(), []);
  const baseEmissive = glassMaterial.emissiveIntensity;
  const baseOpacity = glassMaterial.opacity;

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

    const swayX = Math.sin(t * slot.swayFreq + slot.phase) * slot.swayAmp;
    const swayZ = Math.cos(t * slot.swayFreq * 0.7 + slot.phase) * slot.swayAmp * 0.5;
    const bob = slot.appear >= 1 ? Math.sin(t * 1.05 + slot.phase) * 0.04 : 0;

    // Settle onto the grid from slightly below while fading/scaling in.
    const settle = (1 - enter) * 2.2;
    const worldScale = slot.scale * (0.2 + 0.8 * enter);

    groupRef.current.position.set(slot.x + swayX, slot.y + bob - settle, slot.z + swayZ);
    groupRef.current.scale.setScalar(worldScale);
    groupRef.current.rotation.set(
      slot.tilt,
      slot.yaw + t * 0.035 * slot.spinMul,
      slot.tilt * 0.35,
    );
    groupRef.current.visible = visibility > 0.02;

    glassMaterial.opacity = baseOpacity * visibility;
    glassMaterial.emissiveIntensity = (baseEmissive + 0.03 * Math.sin(t * 0.7 + slot.phase)) * visibility;
  });

  return (
    <group ref={groupRef}>
      <ChessPiece kind={slot.kind} material={glassMaterial} />
    </group>
  );
}
