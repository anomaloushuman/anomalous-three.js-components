import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { prefersShaderOnlyIntro } from './browser';
import {
  INTRO_DURATION,
  INTRO_EXPOSURE,
  easeOutCubic,
  setIntroProgress,
} from './introState';

interface IntroControllerProps {
  enabled?: boolean;
}

export function IntroController({ enabled = true }: IntroControllerProps) {
  const { gl } = useThree();
  const shaderOnlyIntro = useMemo(() => prefersShaderOnlyIntro(), []);

  useFrame((state) => {
    if (!enabled) {
      setIntroProgress(1);
      gl.toneMappingExposure = INTRO_EXPOSURE;
      return;
    }

    const t = Math.min(state.clock.elapsedTime / INTRO_DURATION, 1);
    setIntroProgress(easeOutCubic(t));

    if (shaderOnlyIntro) {
      gl.toneMappingExposure = INTRO_EXPOSURE;
      return;
    }

    const exposureT = Math.min(t / 0.55, 1);
    gl.toneMappingExposure = THREE.MathUtils.lerp(
      0.04,
      INTRO_EXPOSURE,
      easeOutCubic(exposureT),
    );
  });

  return null;
}
