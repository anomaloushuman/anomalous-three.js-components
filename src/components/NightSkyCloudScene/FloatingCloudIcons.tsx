import { useMemo } from 'react';
import * as THREE from 'three';
import { MeshLambertMaterial } from 'three';
import { Clouds } from '@react-three/drei';
import { FloatingCloudIcon } from './FloatingCloudIcon';
import type { CloudLayout } from './types';
import { CLOUD_COLOR } from './types';
import { HORIZON_Y } from './sceneConstants';
import { STREAM_X_MAX, STREAM_X_MIN } from './cloudStream';

interface FloatingCloudIconsProps {
  count?: number;
  interactive?: boolean;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const WRAP_X_MIN = STREAM_X_MIN;
const WRAP_X_MAX = STREAM_X_MAX;
/** Global size multiplier for all cloud layouts */
const CLOUD_SIZE = 1.22;

function generateLayouts(count: number): CloudLayout[] {
  const rand = seededRandom(42);
  const layouts: CloudLayout[] = [];

  for (let i = 0; i < count; i++) {
    const streamProgress = rand();
    const x = WRAP_X_MIN + streamProgress * (WRAP_X_MAX - WRAP_X_MIN);
    const y = HORIZON_Y + 8 + rand() * 10;
    const z = -25 - rand() * 45;

    const depthNorm = (-z - 25) / 45;
    const scale = (0.7 + (1 - depthNorm) * 0.5 + rand() * 0.2) * CLOUD_SIZE;

    layouts.push({
      position: [x, y, z],
      scale,
      phase: rand() * Math.PI * 2,
      rotationSpeed: 0.08 + rand() * 0.1,
    });
  }

  return layouts;
}

function createCloudMaterial() {
  const tint = new THREE.Color(CLOUD_COLOR);
  return class extends MeshLambertMaterial {
    constructor() {
      super();
      this.color = tint;
      this.emissive = tint;
      this.emissiveIntensity = 0.22;
    }
  };
}

export function FloatingCloudIcons({ count = 12, interactive = true }: FloatingCloudIconsProps) {
  const layouts = useMemo(() => generateLayouts(count), [count]);
  const CloudMaterial = useMemo(() => createCloudMaterial(), []);

  return (
    <Clouds limit={count * 32} frustumCulled={false} material={CloudMaterial}>
      {layouts.map((layout, i) => (
        <FloatingCloudIcon
          key={i}
          cloudIndex={i}
          position={layout.position}
          scale={layout.scale}
          phase={layout.phase}
          rotationSpeed={layout.rotationSpeed}
          interactive={interactive}
        />
      ))}
    </Clouds>
  );
}
