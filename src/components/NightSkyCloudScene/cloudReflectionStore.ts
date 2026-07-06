import * as THREE from 'three';

export const MAX_CLOUD_REFLECTIONS = 12;

export const cloudReflectionPositions: THREE.Vector3[] = Array.from(
  { length: MAX_CLOUD_REFLECTIONS },
  () => new THREE.Vector3(),
);

export const cloudReflectionScales: number[] = Array.from(
  { length: MAX_CLOUD_REFLECTIONS },
  () => 1,
);

export function setCloudReflection(
  index: number,
  position: THREE.Vector3,
  scale: number,
) {
  if (index < MAX_CLOUD_REFLECTIONS) {
    cloudReflectionPositions[index].copy(position);
    cloudReflectionScales[index] = scale;
  }
}
