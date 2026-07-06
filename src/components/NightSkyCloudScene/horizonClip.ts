import * as THREE from 'three';
import { OCEAN_Y } from './sceneConstants';

const _horizonPoint = new THREE.Vector3();
const _viewDir = new THREE.Vector3();
const _flatDir = new THREE.Vector3();
const _bufferSize = new THREE.Vector2();

/** Drawing-buffer height for screen-space horizon tests (avoids DPR mismatch). */
export function setResolutionFromGl(
  gl: THREE.WebGLRenderer,
  resolution: THREE.Vector2,
): void {
  gl.getDrawingBufferSize(_bufferSize);
  resolution.copy(_bufferSize);
}

/** NDC y of the flat-ocean horizon for the current camera (-1 bottom, +1 top). */
export function computeHorizonNdcY(camera: THREE.Camera): number {
  if (!(camera instanceof THREE.PerspectiveCamera)) return 0;

  camera.getWorldDirection(_viewDir);
  _flatDir.set(_viewDir.x, 0, _viewDir.z);

  if (_flatDir.lengthSq() < 1e-8) {
    return _viewDir.y > 0 ? 1 : -1;
  }

  _flatDir.normalize();
  const { x, z } = camera.position;

  _horizonPoint.set(x + _flatDir.x * 8000, OCEAN_Y, z + _flatDir.z * 8000);
  _horizonPoint.project(camera);

  return THREE.MathUtils.clamp(_horizonPoint.y, -1, 1);
}
