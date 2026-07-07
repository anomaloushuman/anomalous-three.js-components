import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_CENTER_Z, PLATFORM_DEPTH, PLATFORM_HEIGHT, PLATFORM_WIDTH, RACK_FLOOR_Y, RACK_HEIGHT } from './dataCenterConstants';
import { DC_ACCENT_COLOR, LED_CYAN } from './types';

export function RaisedFloor({ introReveal }: { introReveal: number }) {
  return (
    <group position={[0, PLATFORM_HEIGHT, GRID_CENTER_Z]}>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[PLATFORM_WIDTH - 0.2, 0.024, PLATFORM_DEPTH - 0.2]} />
        <meshStandardMaterial
          color="#252f40"
          metalness={0.55}
          roughness={0.45}
          emissive="#194bcd"
          emissiveIntensity={0.012 * introReveal}
        />
      </mesh>
    </group>
  );
}

export function CableTrayOverhead({ introReveal }: { introReveal: number }) {
  const y = RACK_FLOOR_Y + RACK_HEIGHT + 0.35;
  const railOffset = 0.35;

  return (
    <group position={[0, y, 0]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0, side * (PLATFORM_DEPTH / 2 - railOffset)]}>
          <boxGeometry args={[PLATFORM_WIDTH * 0.9, 0.06, 0.06]} />
          <meshStandardMaterial color="#3a4555" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh
          key={i}
          position={[-PLATFORM_WIDTH / 2 + 0.8 + i * (PLATFORM_WIDTH - 1.6) / 8, -0.04, 0]}
        >
          <boxGeometry args={[0.04, 0.04, PLATFORM_DEPTH - 0.8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Fiber bundle along tray */}
      <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, PLATFORM_WIDTH * 0.75, 8]} />
        <meshStandardMaterial
          color="#1a3050"
          emissive={DC_ACCENT_COLOR}
          emissiveIntensity={0.15 * introReveal}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function NetworkEdgeCabinets({ introReveal }: { introReveal: number }) {
  const positions: [number, number, number][] = [
    [-PLATFORM_WIDTH / 2 + 0.75, RACK_FLOOR_Y + 1.55, -0.5],
    [PLATFORM_WIDTH / 2 - 0.75, RACK_FLOOR_Y + 1.55, -0.5],
  ];

  return (
    <>
      {positions.map((pos, ci) => (
        <group key={ci} position={pos}>
          {/* Cabinet frame */}
          <mesh>
            <boxGeometry args={[0.9, 3.2, 0.8]} />
            <meshStandardMaterial color="#1a2434" metalness={0.78} roughness={0.26} />
          </mesh>
          {/* Switch stack */}
          {[0, 1].map((sw) => (
            <group key={sw} position={[0, 0.5 - sw * 0.38, 0.42]}>
              <mesh>
                <boxGeometry args={[0.82, 0.32, 0.04]} />
                <meshStandardMaterial color="#222c3c" metalness={0.8} roughness={0.25} />
              </mesh>
              {Array.from({ length: 10 }).map((_, port) => (
                <mesh key={port} position={[-0.32 + port * 0.07, 0, 0.025]}>
                  <boxGeometry args={[0.04, 0.05, 0.012]} />
                  <meshStandardMaterial
                    color={port % 2 === 0 ? LED_CYAN : '#1a2535'}
                    emissive={port % 2 === 0 ? LED_CYAN : '#0a1018'}
                    emissiveIntensity={port % 2 === 0 ? 0.75 * introReveal : 0.04}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          ))}
          {/* Patch panels */}
          {Array.from({ length: 4 }).map((_, row) => (
            <group key={row} position={[0, -0.5 - row * 0.42, 0.42]}>
              <mesh>
                <boxGeometry args={[0.82, 0.34, 0.035]} />
                <meshStandardMaterial color="#2a3548" metalness={0.7} roughness={0.32} />
              </mesh>
              {Array.from({ length: 10 }).map((__, port) => (
                <mesh key={port} position={[-0.32 + port * 0.07, 0, 0.022]}>
                  <boxGeometry args={[0.035, 0.065, 0.01]} />
                  <meshStandardMaterial
                    color={port % 3 === 0 ? '#fbbf24' : '#253040'}
                    emissive={port % 3 === 0 ? '#fbbf24' : '#101820'}
                    emissiveIntensity={port % 3 === 0 ? 0.4 * introReveal : 0.03}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          ))}
          {/* Fiber tray on top */}
          <mesh position={[0, 1.72, 0]}>
            <boxGeometry args={[0.95, 0.1, 0.85]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function CracUnit({ position }: { position: [number, number, number] }) {
  const fan1 = useRef<THREE.Mesh>(null);
  const fan2 = useRef<THREE.Mesh>(null);
  const h = 2.8;
  const w = 1.5;
  const d = 1.25;

  useFrame((state) => {
    const speed = state.clock.elapsedTime * 2.5;
    if (fan1.current) fan1.current.rotation.z = speed;
    if (fan2.current) fan2.current.rotation.z = -speed * 0.9;
  });

  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#2a3544" metalness={0.62} roughness={0.36} />
      </mesh>
      {/* CRAC label panel */}
      <mesh position={[0, h - 0.25, d / 2 + 0.01]}>
        <boxGeometry args={[w * 0.55, 0.22, 0.03]} />
        <meshStandardMaterial
          color="#0a1420"
          emissive={DC_ACCENT_COLOR}
          emissiveIntensity={0.12}
          toneMapped={false}
        />
      </mesh>
      {/* Louvered intake */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, 0.45 + i * 0.27, d / 2 + 0.012]}>
          <boxGeometry args={[w * 0.88, 0.055, 0.025]} />
          <meshStandardMaterial color="#141c28" metalness={0.65} roughness={0.42} />
        </mesh>
      ))}
      {/* Fan guards */}
      {[-0.32, 0.32].map((x, i) => (
        <group key={i}>
          <mesh position={[x, h * 0.52, d / 2 + 0.015]}>
            <ringGeometry args={[0.12, 0.28, 16]} />
            <meshStandardMaterial color="#3a4558" metalness={0.85} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={i === 0 ? fan1 : fan2} position={[x, h * 0.52, d / 2 + 0.025]}>
            <circleGeometry args={[0.2, 6]} />
            <meshStandardMaterial color="#556578" emissive="#2a4060" emissiveIntensity={0.15} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* Exhaust plenum */}
      <mesh position={[0, h + 0.06, 0]}>
        <boxGeometry args={[w * 0.92, 0.1, d * 0.92]} />
        <meshStandardMaterial color="#1e2838" metalness={0.75} roughness={0.28} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-0.4 + i * 0.2, h + 0.12, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.5]} />
          <meshStandardMaterial color="#141c26" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function UpsModule({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * (PLATFORM_WIDTH / 2 + 0.55), PLATFORM_HEIGHT / 2 + 0.65, 0]}>
      <mesh>
        <boxGeometry args={[0.75, 1.3, 2.5]} />
        <meshStandardMaterial color="#252f3d" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Display panel */}
      <mesh position={[side * 0.02, 0.45, 1.26]}>
        <boxGeometry args={[0.45, 0.18, 0.02]} />
        <meshStandardMaterial color="#0a1828" emissive={DC_ACCENT_COLOR} emissiveIntensity={0.2} toneMapped={false} />
      </mesh>
      {/* Battery modules */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, -0.15 + i * 0.28, 0.02]}>
          <boxGeometry args={[0.62, 0.22, 2.2]} />
          <meshStandardMaterial color="#1a222e" metalness={0.5} roughness={0.42} />
        </mesh>
      ))}
      {/* Status LEDs */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[side * 0.36, 0.35 - i * 0.12, 1.28]}>
          <boxGeometry args={[0.035, 0.035, 0.01]} />
          <meshStandardMaterial color="#3dba58" emissive="#3dba58" emissiveIntensity={0.35} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
