import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FloatingPerson } from './FloatingPerson';
import type { PersonSlot } from './types';
import {
  ASCEND_SPEED_MAX,
  ASCEND_SPEED_MIN,
  DEFAULT_PEOPLE_COUNT,
  DESPAWN_Y,
  ICON_SIZE,
  INTRO_PIECE_DELAY,
  INTRO_PIECE_STAGGER,
  SPAWN_Y,
} from './ascendConstants';
import {
  buildSpawnCells,
  cellKey,
  distributeSpawnCells,
  pickFreeSpawnCell,
  viewLane,
  type GridCell,
} from './gridPlacement';
import { kindForId, PIECE_SPEED_MUL, PIECE_SPIN_MUL } from './pieceMotion';

interface FloatingPeopleIconsProps {
  count?: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randomIn(rand: () => number, min: number, max: number) {
  return min + rand() * (max - min);
}

function createSlot(id: number, rand: () => number, cell: GridCell, spawnDelay = 0): PersonSlot {
  const kind = kindForId(id);
  const [speedLo, speedHi] = PIECE_SPEED_MUL[kind];
  const baseSpeed = randomIn(rand, ASCEND_SPEED_MIN, ASCEND_SPEED_MAX);

  return {
    id,
    kind,
    x: cell.x,
    y: SPAWN_Y,
    z: cell.z,
    scale: ICON_SIZE * (0.94 + rand() * 0.12),
    phase: rand() * Math.PI * 2,
    speed: baseSpeed * randomIn(rand, speedLo, speedHi),
    swayAmp: 0,
    swayFreq: 0.2,
    yaw: rand() * Math.PI * 2,
    tilt: (rand() - 0.5) * 0.12,
    spinMul: PIECE_SPIN_MUL[kind],
    appear: 0,
    spawnDelay,
  };
}

function applySlot(slot: PersonSlot, next: PersonSlot) {
  slot.kind = next.kind;
  slot.x = next.x;
  slot.y = next.y;
  slot.z = next.z;
  slot.scale = next.scale;
  slot.phase = next.phase;
  slot.speed = next.speed;
  slot.swayAmp = next.swayAmp;
  slot.swayFreq = next.swayFreq;
  slot.yaw = next.yaw;
  slot.tilt = next.tilt;
  slot.spinMul = next.spinMul;
  slot.appear = next.appear;
  slot.spawnDelay = next.spawnDelay;
}

export function FloatingPeopleIcons({ count = DEFAULT_PEOPLE_COUNT }: FloatingPeopleIconsProps) {
  const rand = useMemo(() => seededRandom(91), []);
  const spawnCells = useMemo(() => buildSpawnCells(), []);
  const occupiedCellsRef = useRef<Set<string>>(new Set());
  const occupiedLanesRef = useRef<Set<number>>(new Set());

  const slots = useMemo(() => {
    const r = seededRandom(91);
    const cells = distributeSpawnCells(spawnCells, count);

    // Near → far wave so the grid fills toward the horizon on load.
    cells.sort((a, b) => b.z - a.z);

    occupiedCellsRef.current = new Set(cells.map(cellKey));
    occupiedLanesRef.current = new Set(cells.map(viewLane));

    return cells.map((cell, i) => {
      const spawnDelay = INTRO_PIECE_DELAY + i * INTRO_PIECE_STAGGER + r() * 0.08;
      return createSlot(i, r, cell, spawnDelay);
    });
  }, [count, spawnCells]);

  useFrame((_, delta) => {
    const occupiedCells = occupiedCellsRef.current;
    const occupiedLanes = occupiedLanesRef.current;

    for (const slot of slots) {
      if (slot.spawnDelay > 0) {
        slot.spawnDelay = Math.max(0, slot.spawnDelay - delta);
        continue;
      }

      // Stay on the grid until fully transitioned in, then ascend.
      if (slot.appear < 1) continue;

      slot.y += slot.speed * delta;
      if (slot.y <= DESPAWN_Y) continue;

      occupiedCells.delete(cellKey(slot));
      occupiedLanes.delete(viewLane(slot));

      const free = pickFreeSpawnCell(spawnCells, occupiedCells, occupiedLanes, rand);
      if (!free) {
        slot.y = DESPAWN_Y + 1;
        continue;
      }

      occupiedCells.add(cellKey(free));
      occupiedLanes.add(viewLane(free));
      applySlot(slot, createSlot(slot.id, rand, free, 0));
    }
  });

  return (
    <group>
      {slots.map((slot) => (
        <FloatingPerson key={slot.id} slot={slot} />
      ))}
    </group>
  );
}
