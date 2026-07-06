import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SkyDome } from './SkyDome';
import { Ocean } from './Ocean';
import { OceanFog } from './OceanFog';
import { Moon } from './Moon';
import { Starfield } from './Starfield';
import { FloatingCloudIcons } from './FloatingCloudIcons';
import { prefersShaderOnlyIntro } from './browser';
import { IntroController } from './IntroController';
import {
  ParallaxCamera,
  handlePointerMove,
  useParallaxState,
} from './ParallaxCamera';
import { CAMERA_FAR, CAMERA_FOV, CAMERA_POS } from './sceneConstants';
import {
  INTRO_CAMERA_POS,
  INTRO_EXPOSURE,
  INTRO_LOOK_AT,
  setIntroEnabled,
} from './introState';
import { type NightSkyCloudSceneProps } from './types';

function SceneContent({
  cloudCount,
  starCount,
  interactive,
  autoRotate,
  introAnimation,
  parallax,
}: Required<Pick<NightSkyCloudSceneProps, 'cloudCount' | 'starCount' | 'interactive' | 'autoRotate' | 'introAnimation'>> & {
  parallax: ReturnType<typeof useParallaxState>;
}) {
  return (
    <>
      <color attach="background" args={['#000308']} />
      <IntroController enabled={introAnimation} />
      <SkyDome />
      <Moon />

      <ambientLight intensity={0.2} color="#8090b0" />
      <directionalLight position={[8, 30, 12]} intensity={0.38} color="#d8e4ff" />
      <directionalLight position={[-10, 18, -8]} intensity={0.04} color="#405068" />

      <ParallaxCamera
        parallax={parallax}
        interactive={interactive}
        autoRotate={autoRotate}
        parallaxStrength={1.2}
      />
      <Starfield count={starCount} parallax={interactive ? parallax : null} />
      <FloatingCloudIcons count={cloudCount} interactive={interactive} />
      <Ocean cloudCount={cloudCount} parallax={interactive ? parallax : null} />
      <OceanFog />
    </>
  );
}

export function NightSkyCloudScene({
  className,
  style,
  cloudCount = 12,
  starCount = 2500,
  interactive = true,
  autoRotate = false,
  introAnimation = true,
}: NightSkyCloudSceneProps) {
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
          cloudCount={cloudCount}
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

export type { NightSkyCloudSceneProps } from './types';
