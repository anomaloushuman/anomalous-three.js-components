import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Soft circular mote texture for dust-like points. */
function createSoftMoteTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(230,240,255,0.65)');
  g.addColorStop(0.5, 'rgba(170,200,255,0.2)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

interface ParticleField {
  positions: Float32Array;
  velocities: Float32Array;
  phases: Float32Array;
}

function buildField(
  count: number,
  seed: number,
  bounds: { x: number; yMin: number; yMax: number; zNear: number; zFar: number },
): ParticleField {
  const rand = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const depthNorm = rand();
    const z = bounds.zNear + depthNorm * (bounds.zFar - bounds.zNear);
    const yBias = Math.pow(rand(), 1.2);
    const y = bounds.yMin + yBias * (bounds.yMax - bounds.yMin);
    const x = (rand() * 2 - 1) * bounds.x * (0.55 + depthNorm * 0.55);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    velocities[i * 3] = (rand() - 0.5) * 0.14;
    velocities[i * 3 + 1] = 0.12 + rand() * 0.28;
    velocities[i * 3 + 2] = (rand() - 0.5) * 0.08;
    phases[i] = rand() * Math.PI * 2;
  }

  return { positions, velocities, phases };
}

interface LayerProps {
  field: ParticleField;
  map: THREE.Texture;
  color: string;
  size: number;
  opacity: number;
  riseScale: number;
}

function DustLayer({ field, map, color, size, opacity, riseScale }: LayerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(field.positions.slice(), 3));
    return g;
  }, [field]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const pos = points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < field.phases.length; i++) {
      const phase = field.phases[i]!;
      const swayX = Math.sin(t * 0.21 + phase) * 0.04;
      const swayZ = Math.cos(t * 0.17 + phase * 1.3) * 0.03;

      let x = pos.getX(i) + (field.velocities[i * 3]! + swayX) * dt;
      let y = pos.getY(i) + field.velocities[i * 3 + 1]! * riseScale * dt;
      let z = pos.getZ(i) + (field.velocities[i * 3 + 2]! + swayZ) * dt;

      if (y > 58) {
        y = -1.5 - ((phase * 1.7) % 4);
        x = Math.sin(phase * 3.1) * 70;
        z = -20 - ((phase * 47) % 160);
      }
      if (x > 90) x = -90;
      if (x < -90) x = 90;
      if (z > -8) z = -180;
      if (z < -200) z = -16;

      pos.setXYZ(i, x, y, z);
    }

    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geom} frustumCulled={false}>
      <pointsMaterial
        map={map}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/** Soft atmospheric dust / mote haze — layered, drifting, size-attenuated. */
export function StaffingParticles() {
  const map = useMemo(() => createSoftMoteTexture(), []);

  const far = useMemo(
    () =>
      buildField(900, 173, {
        x: 95,
        yMin: -2,
        yMax: 52,
        zNear: -25,
        zFar: -200,
      }),
    [],
  );

  const mid = useMemo(
    () =>
      buildField(360, 401, {
        x: 70,
        yMin: -1,
        yMax: 38,
        zNear: -14,
        zFar: -130,
      }),
    [],
  );

  const near = useMemo(
    () =>
      buildField(120, 619, {
        x: 45,
        yMin: -0.5,
        yMax: 24,
        zNear: -10,
        zFar: -65,
      }),
    [],
  );

  return (
    <group>
      <DustLayer field={far} map={map} color="#7a9bd8" size={0.55} opacity={0.35} riseScale={0.55} />
      <DustLayer field={mid} map={map} color="#9bb4e8" size={0.75} opacity={0.42} riseScale={0.75} />
      <DustLayer field={near} map={map} color="#c5d6ff" size={1.05} opacity={0.5} riseScale={1} />
    </group>
  );
}
