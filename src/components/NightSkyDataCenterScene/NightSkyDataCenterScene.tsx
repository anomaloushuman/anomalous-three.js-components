import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkyDome } from '../NightSkyCloudScene/SkyDome';
import { Ocean } from '../NightSkyCloudScene/Ocean';
import { OceanFog } from '../NightSkyCloudScene/OceanFog';
import { Moon } from '../NightSkyCloudScene/Moon';
import { Starfield } from '../NightSkyCloudScene/Starfield';
import { prefersShaderOnlyIntro } from '../NightSkyCloudScene/browser';
import { IntroController } from '../NightSkyCloudScene/IntroController';
import {
  handlePointerMove,
  useParallaxState,
} from '../NightSkyCloudScene/ParallaxCamera';
import { CAMERA_FAR } from '../NightSkyCloudScene/sceneConstants';
import {
  INTRO_EXPOSURE,
  setIntroEnabled,
} from '../NightSkyCloudScene/introState';
import { DataCenterCluster } from './DataCenterCluster';
import { DataCenterCamera } from './DataCenterCamera';
import { DataCenterSceneEffects } from './DataCenterSceneEffects';
import {
  DATA_CENTER_POSITION,
  DC_CAMERA_POS,
  DC_INTRO_CAMERA_POS,
  DC_INTRO_LOOK_AT,
  DC_OCEAN_ANCHOR_RIPPLE,
  OCEAN_GRID_COL_SPACING,
  OCEAN_GRID_ROW_SPACING,
} from './dataCenterConstants';
import { aisleWorldX } from './dcCameraPath';
import type { NightSkyDataCenterSceneProps } from './types';

function SceneContent({
  starCount,
  interactive,
  autoRotate,
  introAnimation,
  parallax,
}: Required<Pick<NightSkyDataCenterSceneProps, 'starCount' | 'interactive' | 'autoRotate' | 'introAnimation'>> & {
  parallax: ReturnType<typeof useParallaxState>;
}) {
  const anchorRef = useRef<[number, number]>([0, DATA_CENTER_POSITION[2]]);

  return (
    <>
      <color attach="background" args={['#000308']} />
      <IntroController enabled={introAnimation} />
      <SkyDome />
      <Moon />

      <ambientLight intensity={0.14} color="#8098b8" />
      <hemisphereLight args={['#304868', '#0a1020', 0.22]} />

      <DataCenterSceneEffects />

      <DataCenterCamera
        parallax={parallax}
        interactive={interactive}
        autoRotate={autoRotate}
      />
      <Starfield count={starCount} parallax={interactive ? parallax : null} />
      <DataCenterCluster parallax={interactive ? parallax : null} />
      <TravelingOceanAnchor anchorRef={anchorRef} />
      <Ocean
        cloudCount={0}
        parallax={interactive ? parallax : null}
        anchorXZ={anchorRef.current}
        anchorRippleStrength={DC_OCEAN_ANCHOR_RIPPLE}
        syncGridScroll
        aisleCenterZ={DATA_CENTER_POSITION[2]}
        aisleRowSize={OCEAN_GRID_ROW_SPACING}
        aisleColSize={OCEAN_GRID_COL_SPACING}
      />
      <OceanFog />
    </>
  );
}

/** Keeps ocean ripple anchor traveling with the camera */
function TravelingOceanAnchor({ anchorRef }: { anchorRef: React.MutableRefObject<[number, number]> }) {
  useFrame(() => {
    anchorRef.current[0] = aisleWorldX();
    anchorRef.current[1] = DATA_CENTER_POSITION[2];
  });
  return null;
}

export function NightSkyDataCenterScene({
  className,
  style,
  starCount = 1200,
  interactive = true,
  autoRotate = false,
  introAnimation = true,
}: NightSkyDataCenterSceneProps) {
  const parallax = useParallaxState();
  const containerRef = useRef<HTMLDivElement>(null);
  const shaderOnlyIntro = useMemo(() => prefersShaderOnlyIntro(), []);
  const [revealed, setRevealed] = useState(!introAnimation || shaderOnlyIntro);

  useEffect(() => {
    setIntroEnabled(introAnimation);
  }, [introAnimation]);

  useEffect(() => {
    if (!introAnimation || shaderOnlyIntro) return;
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [introAnimation, shaderOnlyIntro]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        opacity: revealed ? 1 : 0,
        transition: introAnimation && !shaderOnlyIntro ? 'opacity 1.2s ease-out' : undefined,
        ...style,
      }}
      onPointerMove={(e) => handlePointerMove(e, parallax, interactive)}
    >
      <Canvas
        camera={{ position: DC_CAMERA_POS, fov: 44, near: 0.1, far: CAMERA_FAR }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows={false}
        onCreated={({ camera, gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.shadowMap.enabled = false;
          if (introAnimation) {
            camera.position.set(...DC_INTRO_CAMERA_POS);
            camera.lookAt(...DC_INTRO_LOOK_AT);
            gl.toneMappingExposure = shaderOnlyIntro ? INTRO_EXPOSURE : 0.04;
          } else {
            gl.toneMappingExposure = INTRO_EXPOSURE;
          }
        }}
      >
        <SceneContent
          starCount={starCount}
          interactive={interactive}
          autoRotate={autoRotate}
          introAnimation={introAnimation}
          parallax={parallax}
        />
      </Canvas>
    </div>
  );
}

export type { NightSkyDataCenterSceneProps } from './types';
