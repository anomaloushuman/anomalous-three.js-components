export type EquipmentKind = 'compute' | 'storage' | 'switch' | 'patch' | 'blank';

export interface RackEquipment {
  uStart: number;
  uHeight: number;
  kind: EquipmentKind;
  activity: number;
  seed: number;
}

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Build a realistic 42U stack — compute-heavy with storage base and network top. */
export function buildRackEquipment(seed: number): RackEquipment[] {
  const rand = seededRand(seed);
  const units: RackEquipment[] = [];
  let u = 0;

  const push = (kind: EquipmentKind, uHeight: number) => {
    if (u + uHeight > 42) return;
    units.push({
      uStart: u,
      uHeight,
      kind,
      activity: rand(),
      seed: seed + u * 31 + kind.length,
    });
    u += uHeight;
  };

  push('storage', 4);
  push('storage', 2);
  while (u < 34) {
    const roll = rand();
    const before = u;
    if (roll < 0.06) push('blank', 1);
    else if (roll < 0.12) push('compute', 2);
    else push('compute', 1);
    if (u === before) break;
  }
  push('switch', 1);
  push('switch', 1);
  push('patch', 1);

  return units;
}
