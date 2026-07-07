import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getIntroProgress, introStage } from '../NightSkyCloudScene/introState';
import { FacilityAtmosphere } from './FacilityAtmosphere';
import { ScrollingAisleDeck } from './ScrollingAisleDeck';
import { OceanEmbedWake } from './OceanEmbedWake';
import { ServerGrid } from './ServerGrid';
import { DATA_CENTER_POSITION } from './dataCenterConstants';
import { dcCameraPath, getScrollMod } from './dcCameraPath';
import type { ParallaxState } from '../NightSkyCloudScene/types';

function introDataCenterMix(progress: number): number {
  return introStage(progress, 0.28, 0.88);
}

interface DataCenterClusterProps {
  parallax?: ParallaxState | null;
}

export function DataCenterCluster({ parallax = null }: DataCenterClusterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scrollRef = useRef<THREE.Group>(null);
  const introReveal = introDataCenterMix(getIntroProgress());

  useFrame(() => {
    if (!groupRef.current) return;
    const reveal = introDataCenterMix(getIntroProgress());
    const scroll = dcCameraPath.scrollX;
    const mod = getScrollMod(scroll);

    let px = 0;
    if (parallax) {
      px = parallax.target.x * 0.06 * reveal;
    }

    groupRef.current.position.set(
      DATA_CENTER_POSITION[0] + scroll - mod + px,
      DATA_CENTER_POSITION[1],
      DATA_CENTER_POSITION[2],
    );

    const scale = THREE.MathUtils.lerp(0.72, 1, reveal);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={DATA_CENTER_POSITION}>
      <group ref={scrollRef} renderOrder={1}>
        <OceanEmbedWake introReveal={introReveal} />
        <FacilityAtmosphere introReveal={introReveal} />
        <ScrollingAisleDeck introReveal={introReveal} />
        <ServerGrid introReveal={introReveal} />
      </group>
    </group>
  );
}
