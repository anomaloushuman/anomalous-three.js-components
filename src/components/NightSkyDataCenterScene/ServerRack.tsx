import { useMemo } from 'react';
import { RACK_DEPTH, RACK_HEIGHT, RACK_WIDTH } from './dataCenterConstants';
import { buildRackEquipment } from './equipmentTypes';
import { ServerUnit } from './ServerUnit';

const U_SIZE = RACK_HEIGHT / 42;
const FRAME = { color: '#2e3a4c' };
const RAIL = { color: '#4a5568' };

interface ServerRackProps {
  position: [number, number, number];
  rotationY?: number;
  seed: number;
  introReveal: number;
  fade?: number;
}

/** Full-detail front-row rack — matte frame, no specular hotspots */
export function ServerRack({ position, rotationY = 0, seed, introReveal, fade = 1 }: ServerRackProps) {
  const equipment = useMemo(() => buildRackEquipment(seed), [seed]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {(
        [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ] as [number, number][]
      ).map(([sx, sz], i) => (
        <mesh key={i} position={[(sx * RACK_WIDTH) / 2, RACK_HEIGHT / 2, (sz * RACK_DEPTH) / 2]}>
          <boxGeometry args={[0.07, RACK_HEIGHT, 0.07]} />
          <meshLambertMaterial {...FRAME} />
        </mesh>
      ))}

      {[0.05, RACK_HEIGHT - 0.05].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, RACK_DEPTH / 2 - 0.04]}>
            <boxGeometry args={[RACK_WIDTH, 0.06, 0.06]} />
            <meshLambertMaterial {...FRAME} />
          </mesh>
          <mesh position={[0, y, -RACK_DEPTH / 2 + 0.04]}>
            <boxGeometry args={[RACK_WIDTH, 0.06, 0.06]} />
            <meshLambertMaterial {...FRAME} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (RACK_WIDTH / 2 - 0.02), RACK_HEIGHT / 2, RACK_DEPTH / 2 + 0.01]}>
          <boxGeometry args={[0.015, RACK_HEIGHT - 0.15, 0.008]} />
          <meshLambertMaterial {...RAIL} />
        </mesh>
      ))}

      <mesh position={[0, RACK_HEIGHT / 2, -RACK_DEPTH / 2 + 0.02]}>
        <boxGeometry args={[RACK_WIDTH - 0.1, RACK_HEIGHT - 0.1, 0.03]} />
        <meshLambertMaterial color="#121820" transparent opacity={0.45 * fade} />
      </mesh>

      {equipment.map((unit, i) => (
        <ServerUnit key={i} unit={unit} uHeight={U_SIZE} introReveal={introReveal * fade} />
      ))}

      {equipment.map((unit, i) => {
        const railY = 0.08 + (unit.uStart + unit.uHeight) * U_SIZE;
        return (
          <mesh key={`rail-${i}`} position={[0, railY, RACK_DEPTH / 2 + 0.02]}>
            <boxGeometry args={[RACK_WIDTH - 0.06, 0.012, 0.025]} />
            <meshLambertMaterial {...RAIL} />
          </mesh>
        );
      })}

      <mesh position={[-RACK_WIDTH / 2 + 0.05, RACK_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.06, RACK_HEIGHT - 0.15, RACK_DEPTH - 0.15]} />
        <meshLambertMaterial color="#222830" />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-RACK_WIDTH / 2 + 0.08, 0.3 + i * 0.27, RACK_DEPTH / 2 - 0.15]}>
          <boxGeometry args={[0.04, 0.07, 0.1]} />
          <meshLambertMaterial color="#2a3544" />
        </mesh>
      ))}

      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (RACK_WIDTH / 2 + 0.025), RACK_HEIGHT / 2, RACK_DEPTH / 2 + 0.015]}>
          <boxGeometry args={[0.035, 0.55, 0.05]} />
          <meshLambertMaterial {...RAIL} />
        </mesh>
      ))}
    </group>
  );
}
