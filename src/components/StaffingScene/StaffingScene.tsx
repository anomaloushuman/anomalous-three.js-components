import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { prefersShaderOnlyIntro } from '../NightSkyCloudScene/browser';
import { IntroController } from '../NightSkyCloudScene/IntroController';
import {
  ParallaxCamera,
  handlePointerMove,
  useParallaxState,
} from '../NightSkyCloudScene/ParallaxCamera';
import { CAMERA_FAR, CAMERA_FOV, CAMERA_POS } from '../NightSkyCloudScene/sceneConstants';
import {
  INTRO_CAMERA_POS,
  INTRO_EXPOSURE,
  INTRO_LOOK_AT,
  setIntroEnabled,
} from '../NightSkyCloudScene/introState';
import { FloatingPeopleIcons } from './FloatingPeopleIcons';
import { DigitalGrid } from './DigitalGrid';
import { CyberSky } from './CyberSky';
import { StaffingParticles } from './StaffingParticles';
import { GridAtmosphere } from './GridAtmosphere';
import type { StaffingSceneProps } from './types';

function SceneContent({
  peopleCount,
  interactive,
  autoRotate,
  introAnimation,
  parallax,
}: Pick<StaffingSceneProps, 'interactive' | 'autoRotate' | 'introAnimation'> & {
  peopleCount?: number;
  parallax: ReturnType<typeof useParallaxState>;
}) {
  return (
    <>
      <color attach="background" args={['#020818']} />
      <fog attach="fog" args={['#04102a', 70, 220]} />
      <IntroController enabled={introAnimation} />
      <CyberSky />
      <DigitalGrid />
      <GridAtmosphere />
      <StaffingParticles />
      <Environment preset="night" environmentIntensity={0.78} />

      <ambientLight intensity={0.62} color="#c7d8fb" />
      <hemisphereLight args={['#8fb0e4', '#0f1726', 0.6]} />
      {/* Soft key from top-left — clay icon volume like the reference */}
      <directionalLight position={[-8, 24, 12]} intensity={1.4} color="#f7fbff" />
      <directionalLight position={[10, 10, -8]} intensity={0.42} color="#5f86d8" />
      <directionalLight position={[0, 8, 18]} intensity={0.54} color="#e1ecff" />
      <pointLight position={[0, 14, -20]} intensity={1.08} distance={95} color="#2a62dd" />
      <pointLight position={[-24, 10, -34]} intensity={0.52} distance={66} color="#8bb1ff" />
      <pointLight position={[24, 9, -26]} intensity={0.48} distance={62} color="#6f97eb" />

      <ParallaxCamera
        parallax={parallax}
        interactive={interactive}
        autoRotate={autoRotate}
        parallaxStrength={1.0}
      />
      <Suspense fallback={null}>
        <FloatingPeopleIcons count={peopleCount} />
      </Suspense>
    </>
  );
}

export function StaffingScene({
  className,
  style,
  peopleCount,
  maxActivePieces,
  interactive = true,
  autoRotate = false,
  introAnimation = true,
}: StaffingSceneProps) {
  const parallax = useParallaxState();
  const containerRef = useRef<HTMLDivElement>(null);
  const shaderOnlyIntro = useMemo(() => prefersShaderOnlyIntro(), []);
  const [revealed, setRevealed] = useState(!introAnimation || shaderOnlyIntro);
  const activePieceCount = maxActivePieces ?? peopleCount ?? 14;

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
        camera={{ position: CAMERA_POS, fov: CAMERA_FOV, near: 0.1, far: CAMERA_FAR }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ camera, gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          if (introAnimation) {
            camera.position.set(...INTRO_CAMERA_POS);
            camera.lookAt(...INTRO_LOOK_AT);
            gl.toneMappingExposure = shaderOnlyIntro ? INTRO_EXPOSURE : 0.04;
          } else {
            gl.toneMappingExposure = INTRO_EXPOSURE;
          }
        }}
      >
        <SceneContent
          peopleCount={activePieceCount}
          interactive={interactive}
          autoRotate={autoRotate}
          introAnimation={introAnimation}
          parallax={parallax}
        />
      </Canvas>
    </div>
  );
}

export type { StaffingSceneProps } from './types';
