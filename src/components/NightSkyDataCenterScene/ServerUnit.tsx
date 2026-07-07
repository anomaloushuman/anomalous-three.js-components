import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RACK_DEPTH, RACK_HEIGHT, RACK_WIDTH } from './dataCenterConstants';
import type { RackEquipment } from './equipmentTypes';
import { LED_AMBER, LED_CYAN, LED_GREEN } from './types';

const BEZEL = '#5a6578';
const CHASSIS = '#243044';
const DRIVE = '#0a0e14';
const VENT = '#0a0e14';

const KIND_ACCENT: Record<string, string> = {
  compute: '#3060a8',
  storage: '#2a6848',
  switch: '#2088b0',
  patch: '#886020',
};

function UnitBezel({ y, h, kind, introReveal }: { y: number; h: number; kind: string; introReveal: number }) {
  const z = RACK_DEPTH / 2 + 0.04;
  const accent = KIND_ACCENT[kind] ?? '#3060a8';

  return (
    <>
      {[1, -1].map((sign) => (
        <mesh key={sign} position={[0, y + sign * (h / 2 - 0.01), z - 0.01]}>
          <boxGeometry args={[RACK_WIDTH - 0.08, 0.018, 0.04]} />
          <meshLambertMaterial color="#6a7588" />
        </mesh>
      ))}
      <mesh position={[RACK_WIDTH / 2 - 0.18, y + h / 2 - 0.04, z + 0.01]}>
        <boxGeometry args={[0.28, 0.012, 0.006]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55 * introReveal} toneMapped={false} />
      </mesh>
    </>
  );
}

function ActivityStrip({
  y,
  z,
  width,
  activity,
  introReveal,
}: {
  y: number;
  z: number;
  width: number;
  activity: number;
  introReveal: number;
}) {
  const ref = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * (0.8 + activity * 0.6) + activity * 12);
    ref.current.opacity = (0.35 + activity * 0.25 + pulse * 0.3) * introReveal;
  });

  return (
    <mesh position={[RACK_WIDTH * 0.15, y, z]}>
      <boxGeometry args={[width, 0.016, 0.008]} />
      <meshBasicMaterial ref={ref} color={LED_CYAN} transparent opacity={0.4 * introReveal} toneMapped={false} />
    </mesh>
  );
}

interface ServerUnitProps {
  unit: RackEquipment;
  y: number;
  h: number;
  introReveal: number;
}

function StatusLeds({ y, h, activity, introReveal }: { y: number; h: number; activity: number; introReveal: number }) {
  const power = activity > 0.3 ? LED_GREEN : LED_AMBER;
  const activityColor = activity > 0.65 ? LED_CYAN : LED_GREEN;
  const z = RACK_DEPTH / 2 + 0.05;

  return (
    <>
      <mesh position={[-RACK_WIDTH / 2 + 0.11, y + h * 0.15, z]}>
        <boxGeometry args={[0.055, 0.055, 0.014]} />
        <meshBasicMaterial color={power} transparent opacity={0.9 * introReveal} toneMapped={false} />
      </mesh>
      <mesh position={[-RACK_WIDTH / 2 + 0.11, y - h * 0.1, z]}>
        <boxGeometry args={[0.055, 0.055, 0.014]} />
        <meshBasicMaterial color={activityColor} transparent opacity={(0.5 + activity * 0.4) * introReveal} toneMapped={false} />
      </mesh>
    </>
  );
}

function VentSlits({ y, h, count = 5 }: { y: number; h: number; count?: number }) {
  const z = RACK_DEPTH / 2 + 0.04;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[RACK_WIDTH / 2 - 0.14, y - h / 2 + 0.08 + i * ((h - 0.16) / count), z]}>
          <boxGeometry args={[0.06, 0.014, 0.008]} />
          <meshLambertMaterial color={VENT} />
        </mesh>
      ))}
    </>
  );
}

function ComputeFace({ unit, y, h, introReveal }: ServerUnitProps) {
  const z = RACK_DEPTH / 2 + 0.02;
  const driveCount = unit.uHeight >= 2 ? 4 : 3;

  return (
    <group>
      <mesh position={[0, y, z - 0.04]}>
        <boxGeometry args={[RACK_WIDTH - 0.14, h - 0.008, 0.48]} />
        <meshLambertMaterial color={CHASSIS} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, y, z + 0.008]}>
        <boxGeometry args={[RACK_WIDTH - 0.12, h - 0.004, 0.028]} />
        <meshLambertMaterial color={BEZEL} />
      </mesh>

      {Array.from({ length: driveCount }).map((_, i) => {
        const cols = driveCount === 4 ? 2 : 3;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const ox = (col - (cols - 1) / 2) * 0.28;
        const oy = (row - (driveCount > 3 ? 0.5 : 0)) * 0.22;
        return (
          <mesh key={i} position={[RACK_WIDTH * 0.08 + ox, y + oy, z + 0.018]}>
            <boxGeometry args={[0.2, h * 0.32, 0.012]} />
            <meshLambertMaterial color={DRIVE} />
          </mesh>
        );
      })}

      <mesh position={[RACK_WIDTH * 0.28, y - h * 0.28, z + 0.016]}>
        <boxGeometry args={[RACK_WIDTH * 0.28, 0.035, 0.01]} />
        <meshLambertMaterial color="#1a2535" />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[RACK_WIDTH * 0.16 + i * 0.07, y - h * 0.28, z + 0.022]}>
          <boxGeometry args={[0.035, 0.022, 0.008]} />
          <meshBasicMaterial
            color={i === 0 ? LED_CYAN : '#253040'}
            transparent
            opacity={i === 0 ? 0.75 * introReveal : 0.15}
            toneMapped={false}
          />
        </mesh>
      ))}

      <ActivityStrip y={y + h * 0.32} z={z + 0.018} width={RACK_WIDTH * 0.45} activity={unit.activity} introReveal={introReveal} />
      <StatusLeds y={y} h={h} activity={unit.activity} introReveal={introReveal} />
      <VentSlits y={y} h={h} />
      <UnitBezel y={y} h={h} kind="compute" introReveal={introReveal} />
    </group>
  );
}

function StorageFace({ unit, y, h, introReveal }: ServerUnitProps) {
  const z = RACK_DEPTH / 2 + 0.02;
  const bays = unit.uHeight >= 4 ? 12 : 8;
  const rows = unit.uHeight >= 4 ? 3 : 2;
  const perRow = bays / rows;

  return (
    <group>
      <mesh position={[0, y, z - 0.04]}>
        <boxGeometry args={[RACK_WIDTH - 0.14, h - 0.008, 0.5]} />
        <meshLambertMaterial color="#182028" />
      </mesh>
      <mesh position={[0, y, z + 0.008]}>
        <boxGeometry args={[RACK_WIDTH - 0.12, h - 0.004, 0.028]} />
        <meshLambertMaterial color={BEZEL} />
      </mesh>

      {Array.from({ length: bays }).map((_, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const bx = -RACK_WIDTH / 2 + 0.22 + col * ((RACK_WIDTH - 0.4) / perRow);
        const by = y - h / 2 + 0.14 + row * ((h - 0.28) / rows) + ((h - 0.28) / rows) * 0.5;
        const lit = (i + unit.seed) % 5 === 0;

        return (
          <group key={i}>
            <mesh position={[bx, by, z + 0.018]}>
              <boxGeometry args={[0.22, 0.1, 0.012]} />
              <meshLambertMaterial color={DRIVE} />
            </mesh>
            <mesh position={[bx + 0.08, by + 0.04, z + 0.024]}>
              <boxGeometry args={[0.022, 0.022, 0.006]} />
              <meshBasicMaterial
                color={lit ? LED_GREEN : '#1a3020'}
                transparent
                opacity={lit ? 0.7 * introReveal : 0.08}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      <StatusLeds y={y} h={h} activity={unit.activity} introReveal={introReveal} />
      <UnitBezel y={y} h={h} kind="storage" introReveal={introReveal} />
    </group>
  );
}

function SwitchFace({ unit, y, h, introReveal }: ServerUnitProps) {
  const z = RACK_DEPTH / 2 + 0.02;
  const ports = 16;

  return (
    <group>
      <mesh position={[0, y, z - 0.03]}>
        <boxGeometry args={[RACK_WIDTH - 0.14, h - 0.006, 0.42]} />
        <meshLambertMaterial color="#161e28" />
      </mesh>
      <mesh position={[0, y, z + 0.008]}>
        <boxGeometry args={[RACK_WIDTH - 0.12, h - 0.004, 0.026]} />
        <meshLambertMaterial color={BEZEL} />
      </mesh>

      <mesh position={[-RACK_WIDTH / 2 + 0.22, y, z + 0.018]}>
        <boxGeometry args={[0.18, h * 0.55, 0.01]} />
        <meshBasicMaterial color={LED_CYAN} transparent opacity={0.22 * introReveal} toneMapped={false} />
      </mesh>

      {Array.from({ length: ports }).map((_, i) => {
        const active = (i + unit.seed) % 3 !== 0;
        return (
          <mesh key={i} position={[-RACK_WIDTH / 2 + 0.42 + (i % 8) * 0.09, y + (i < 8 ? 0.04 : -0.06), z + 0.02]}>
            <boxGeometry args={[0.05, 0.055, 0.012]} />
            <meshBasicMaterial
              color={active ? LED_CYAN : '#141c26'}
              transparent
              opacity={active ? (0.4 + unit.activity * 0.35) * introReveal : 0.06}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      <StatusLeds y={y} h={h} activity={unit.activity} introReveal={introReveal} />
      <UnitBezel y={y} h={h} kind="switch" introReveal={introReveal} />
    </group>
  );
}

function PatchFace({ y, h, introReveal }: { y: number; h: number; introReveal: number }) {
  const z = RACK_DEPTH / 2 + 0.02;

  return (
    <group>
      <mesh position={[0, y, z]}>
        <boxGeometry args={[RACK_WIDTH - 0.14, h - 0.006, 0.035]} />
        <meshLambertMaterial color="#1e2838" />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-RACK_WIDTH / 2 + 0.28 + i * 0.1, y, z + 0.022]}>
          <boxGeometry args={[0.045, 0.08, 0.01]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? LED_AMBER : '#253040'}
            transparent
            opacity={i % 2 === 0 ? 0.5 * introReveal : 0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
      <UnitBezel y={y} h={h} kind="patch" introReveal={introReveal} />
    </group>
  );
}

export function ServerUnit({ unit, uHeight, introReveal }: { unit: RackEquipment; uHeight: number; introReveal: number }) {
  const y = uToWorldY(unit.uStart, unit.uHeight, RACK_HEIGHT, uHeight);
  const h = unit.uHeight * uHeight - 0.012;

  if (unit.kind === 'blank') {
    return (
      <mesh position={[0, y, RACK_DEPTH / 2 + 0.01]}>
        <boxGeometry args={[RACK_WIDTH - 0.18, h, 0.02]} />
        <meshLambertMaterial color="#1a2030" />
      </mesh>
    );
  }

  const props = { unit, y, h, introReveal };

  switch (unit.kind) {
    case 'storage':
      return <StorageFace {...props} />;
    case 'switch':
      return <SwitchFace {...props} />;
    case 'patch':
      return <PatchFace y={y} h={h} introReveal={introReveal} />;
    default:
      return <ComputeFace {...props} />;
  }
}

export function uToWorldY(uStart: number, uHeight: number, _rackUHeight: number, uSize: number): number {
  const base = 0.08;
  return base + uStart * uSize + (uHeight * uSize) / 2;
}
