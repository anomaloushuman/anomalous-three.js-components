import { useMemo } from 'react';
import * as THREE from 'three';

const MOON_DIR = new THREE.Vector3(0.25, 0.92, 0.15).normalize();

export function Moon() {
  const moonPos = useMemo(
    () => MOON_DIR.clone().multiplyScalar(140),
    [],
  );

  return (
    <group position={moonPos}>
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#b8c4dc" />
      </mesh>
      <mesh scale={1.8}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#8090b8" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export { MOON_DIR };
