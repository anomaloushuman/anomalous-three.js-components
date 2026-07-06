import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParallaxState } from './types';
import { CAMERA_LOOK_AT, CAMERA_POS } from './sceneConstants';
import {
  INTRO_CAMERA_POS,
  INTRO_LOOK_AT,
  easeOutCubic,
  getIntroProgress,
  introParallaxMix,
  isIntroComplete,
} from './introState';

const _introLookAt = new THREE.Vector3(...INTRO_LOOK_AT);
const _finalLookAt = new THREE.Vector3(...CAMERA_LOOK_AT);
const _blendedLookAt = new THREE.Vector3();

interface ParallaxCameraProps {
  parallax: ParallaxState;
  interactive?: boolean;
  autoRotate?: boolean;
  parallaxStrength?: number;
}

export function ParallaxCamera({
  parallax,
  interactive = true,
  autoRotate = false,
  parallaxStrength = 1.2,
}: ParallaxCameraProps) {
  const { camera } = useThree();

  useFrame((state) => {
    if (interactive) {
      parallax.target.x = THREE.MathUtils.lerp(
        parallax.target.x,
        parallax.pointer.x * parallaxStrength,
        0.05,
      );
      parallax.target.y = THREE.MathUtils.lerp(
        parallax.target.y,
        parallax.pointer.y * parallaxStrength * 0.5,
        0.05,
      );
    }

    const intro = getIntroProgress();
    const introEase = easeOutCubic(intro);
    const parallaxMix = introParallaxMix(intro);

    let offsetX = parallax.target.x * parallaxMix;
    let offsetY = parallax.target.y * parallaxMix;

    if (autoRotate && isIntroComplete()) {
      const t = state.clock.elapsedTime;
      offsetX += Math.sin(t * 0.08) * 0.3;
      offsetY += Math.cos(t * 0.06) * 0.15;
    }

    const baseY = CAMERA_POS[1];
    const baseZ = CAMERA_POS[2];
    const lookY = CAMERA_LOOK_AT[1];
    const lookZ = CAMERA_LOOK_AT[2];

    const finalX = offsetX;
    const finalY = baseY + offsetY * 0.15;
    const finalZ = baseZ;

    if (intro < 1) {
      camera.position.set(
        THREE.MathUtils.lerp(INTRO_CAMERA_POS[0], finalX, introEase),
        THREE.MathUtils.lerp(INTRO_CAMERA_POS[1], finalY, introEase),
        THREE.MathUtils.lerp(INTRO_CAMERA_POS[2], finalZ, introEase),
      );
    } else {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, finalX, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, finalY, 0.04);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, finalZ, 0.04);
    }

    _finalLookAt.set(offsetX * 0.05, lookY + offsetY * 0.08, lookZ);
    _blendedLookAt.lerpVectors(_introLookAt, _finalLookAt, introEase);
    camera.lookAt(_blendedLookAt);
    parallax.pointerVel.multiplyScalar(0.82 * parallaxMix);
  });

  return null;
}

export function useParallaxState(): ParallaxState {
  const state = useRef<ParallaxState>({
    pointer: new THREE.Vector2(0, 0),
    target: new THREE.Vector2(0, 0),
    pointerVel: new THREE.Vector2(0, 0),
  }).current;

  return state;
}

const _prevPointer = new THREE.Vector2();

export function handlePointerMove(
  event: React.PointerEvent<HTMLDivElement>,
  parallax: ParallaxState,
  interactive: boolean,
) {
  if (!interactive) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  parallax.pointerVel.set(
    x - _prevPointer.x,
    y - _prevPointer.y,
  );
  _prevPointer.set(x, y);
  parallax.pointer.set(x, y);
}
