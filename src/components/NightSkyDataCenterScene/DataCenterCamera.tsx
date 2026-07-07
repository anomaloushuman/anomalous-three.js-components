import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParallaxState } from '../NightSkyCloudScene/types';
import { OCEAN_Y } from '../NightSkyCloudScene/sceneConstants';
import {
  easeOutCubic,
  getIntroProgress,
  introParallaxMix,
} from '../NightSkyCloudScene/introState';
import {
  DATA_CENTER_POSITION,
  DC_CAMERA_HEIGHT,
  DC_CAMERA_SPEED,
  DC_CAMERA_Z,
  DC_INTRO_CAMERA_POS,
  DC_INTRO_LOOK_AT,
  DC_LOOK_AHEAD,
  DC_LOOK_AT_Y,
  DC_LOOK_AT_Z,
} from './dataCenterConstants';
import { dcCameraPath } from './dcCameraPath';
import { aisleGridScroll } from '../../shared/aisleGridScroll';

const _introLookAt = new THREE.Vector3(...DC_INTRO_LOOK_AT);
const _pathLookAt = new THREE.Vector3();
const _blendedLookAt = new THREE.Vector3();

interface DataCenterCameraProps {
  parallax: ParallaxState;
  interactive?: boolean;
  autoRotate?: boolean;
  parallaxStrength?: number;
}

export function DataCenterCamera({
  parallax,
  interactive = true,
  parallaxStrength = 0.35,
}: DataCenterCameraProps) {
  const { camera } = useThree();

  useFrame((state) => {
    if (interactive) {
      parallax.target.x = THREE.MathUtils.lerp(
        parallax.target.x,
        parallax.pointer.x * parallaxStrength,
        0.04,
      );
      parallax.target.y = THREE.MathUtils.lerp(
        parallax.target.y,
        parallax.pointer.y * parallaxStrength * 0.35,
        0.04,
      );
    }

    const intro = getIntroProgress();
    const introEase = easeOutCubic(intro);
    const parallaxMix = introParallaxMix(intro) * 0.4;

    const t = state.clock.elapsedTime;
    const pathMix = THREE.MathUtils.smoothstep(intro, 0.55, 0.92);

    const travelX = t * DC_CAMERA_SPEED * pathMix;
    dcCameraPath.scrollX = travelX;
    dcCameraPath.x = travelX;
    aisleGridScroll.x = travelX;
    aisleGridScroll.lock = pathMix;

    const bob = Math.sin(t * 0.22) * 0.06 + Math.sin(t * 0.09) * 0.025;
    const sway = Math.sin(t * 0.05) * 0.03;
    const driftY = Math.sin(t * 0.04) * 0.02;

    const px = parallax.target.x * parallaxMix;
    const py = parallax.target.y * parallaxMix;

    const pathX = travelX + sway + px;
    const pathY = OCEAN_Y + DC_CAMERA_HEIGHT + bob + driftY + py * 0.08;
    const pathZ = DATA_CENTER_POSITION[2] + DC_CAMERA_Z;

    if (intro < 1) {
      camera.position.set(
        THREE.MathUtils.lerp(DC_INTRO_CAMERA_POS[0], pathX, introEase),
        THREE.MathUtils.lerp(DC_INTRO_CAMERA_POS[1], pathY, introEase),
        THREE.MathUtils.lerp(DC_INTRO_CAMERA_POS[2], pathZ, introEase),
      );
    } else {
      camera.position.set(pathX, pathY, pathZ);
    }

    _pathLookAt.set(
      pathX + DC_LOOK_AHEAD * 0.35,
      OCEAN_Y + DC_LOOK_AT_Y + bob * 0.25,
      DATA_CENTER_POSITION[2] + DC_LOOK_AT_Z,
    );
    _blendedLookAt.lerpVectors(_introLookAt, _pathLookAt, introEase);
    camera.lookAt(_blendedLookAt);

    parallax.pointerVel.multiplyScalar(0.82 * parallaxMix);
  });

  return null;
}

export { useParallaxState, handlePointerMove } from '../NightSkyCloudScene/ParallaxCamera';
