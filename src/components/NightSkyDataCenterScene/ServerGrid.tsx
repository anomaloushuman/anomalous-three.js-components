import { useMemo } from 'react';
import {
  GRID_COLS_PER_SEGMENT,
  GRID_FRONT_Z,
  GRID_ROWS,
  RACK_FLOOR_Y,
  RACK_SPACING_X,
  RACK_SPACING_Z,
  RACK_WIDTH,
  SEGMENT_WIDTH,
} from './dataCenterConstants';
import { segmentLocalX, VISIBLE_SEGMENTS } from './dcCameraPath';
import { AisleRack } from './AisleRack';
import { ServerRack } from './ServerRack';

export interface GridRackSlot {
  id: string;
  col: number;
  row: number;
  position: [number, number, number];
  seed: number;
}

/** Continuous column layout — segment width = one full column period */
export function buildSegmentRackSlots(): GridRackSlot[] {
  const slots: GridRackSlot[] = [];
  const originX = -SEGMENT_WIDTH / 2 + RACK_WIDTH / 2;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS_PER_SEGMENT; col++) {
      slots.push({
        id: `${row}-${col}`,
        col,
        row,
        position: [originX + col * RACK_SPACING_X, RACK_FLOOR_Y, GRID_FRONT_Z - row * RACK_SPACING_Z],
        seed: row * 1000 + col * 137,
      });
    }
  }

  return slots;
}

function RackSegment({ segmentIndex, introReveal }: { segmentIndex: number; introReveal: number }) {
  const slots = useMemo(() => buildSegmentRackSlots(), []);

  return (
    <group position={[segmentLocalX(segmentIndex), 0, 0]}>
      {slots.map((slot) =>
        slot.row === 0 ? (
          <ServerRack
            key={`${segmentIndex}-${slot.id}`}
            position={slot.position}
            seed={slot.seed}
            introReveal={introReveal}
          />
        ) : (
          <AisleRack
            key={`${segmentIndex}-${slot.id}`}
            position={slot.position}
            seed={slot.seed}
            introReveal={introReveal}
          />
        ),
      )}
    </group>
  );
}

interface ServerGridProps {
  introReveal: number;
}

export function ServerGrid({ introReveal }: ServerGridProps) {
  return (
    <>
      {Array.from({ length: VISIBLE_SEGMENTS }).map((_, i) => (
        <RackSegment key={i} segmentIndex={i} introReveal={introReveal} />
      ))}
    </>
  );
}
