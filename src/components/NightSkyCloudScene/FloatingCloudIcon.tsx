import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Cloud } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { applyStreamWrap, streamEdgeOpacity } from './cloudStream';
import {
  sampleBuoyancy,
  sampleJetStreamWind,
  sampleWindTilt,
} from './jetStream';
import { CLOUD_COLOR } from './types';
import { introCloudMix, getIntroProgress } from './introState';
import { setCloudReflection } from './cloudReflectionStore';

const BOUNDS_VARIANTS: [number, number, number][] = [
  [5.6, 1.25, 1.85],
  [5, 1.05, 1.6],
  [6.1, 1.35, 2.0],
  [4.5, 1.15, 1.65],
];

const BASE_OPACITY = 0.58;
const HOVER_OPACITY = 0.78;
const OPACITY_UPDATE_EPS = 0.012;

interface FloatingCloudIconProps {
  cloudIndex: number;
  position: [number, number, number];
  scale?: number;
  phase?: number;
  rotationSpeed?: number;
  interactive?: boolean;
}

export function FloatingCloudIcon({
  cloudIndex,
  position,
  scale = 1,
  phase = 0,
  rotationSpeed = 0.15,
  interactive = true,
}: FloatingCloudIconProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);
  const [renderOpacity, setRenderOpacity] = useState(BASE_OPACITY);
  const lastOpacityRef = useRef(BASE_OPACITY);
  const variant = Math.abs(Math.floor(phase * 10)) % BOUNDS_VARIANTS.length;
  const bounds = BOUNDS_VARIANTS[variant];

  const basePosition = useRef(new THREE.Vector3(...position));
  const drift = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(...position));

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    currentPos.current.set(
      basePosition.current.x + drift.current.x,
      basePosition.current.y + drift.current.y,
      basePosition.current.z + drift.current.z,
    );

    const wind = sampleJetStreamWind(currentPos.current, t);
    drift.current.add(wind.multiplyScalar(delta));
    drift.current.x = applyStreamWrap(basePosition.current.x, drift.current.x);

    const buoyancy = sampleBuoyancy(t, phase);
    const x = basePosition.current.x + drift.current.x;
    const y = basePosition.current.y + drift.current.y + buoyancy;
    const z = basePosition.current.z + drift.current.z;

    groupRef.current.position.set(x, y, z);

    const tilt = sampleWindTilt(wind);
    groupRef.current.rotation.y = tilt.yaw + t * rotationSpeed * 0.08;
    groupRef.current.rotation.x = tilt.pitch;
    groupRef.current.rotation.z = tilt.roll;

    const cloudIntro = introCloudMix(getIntroProgress());
    const introScale = scale * THREE.MathUtils.lerp(0.2, 1, cloudIntro);
    groupRef.current.scale.set(introScale, introScale * THREE.MathUtils.lerp(0.6, 1, cloudIntro), introScale);

    const edgeOpacity = streamEdgeOpacity(x);
    const base = hoveredRef.current ? HOVER_OPACITY : BASE_OPACITY;
    const nextOpacity = base * edgeOpacity * cloudIntro;

    if (Math.abs(nextOpacity - lastOpacityRef.current) > OPACITY_UPDATE_EPS) {
      lastOpacityRef.current = nextOpacity;
      setRenderOpacity(nextOpacity);
    }

    groupRef.current.updateWorldMatrix(true, false);
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    setCloudReflection(cloudIndex, worldPos, scale * edgeOpacity);
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    hoveredRef.current = true;
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    if (!interactive) return;
    hoveredRef.current = false;
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <Cloud
        seed={phase * 9973}
        bounds={bounds}
        segments={32}
        volume={8}
        smallestVolume={0.3}
        opacity={renderOpacity}
        speed={0.12}
        growth={0.85}
        fade={100}
        color={CLOUD_COLOR}
        concentrate="inside"
      />
    </group>
  );
}
