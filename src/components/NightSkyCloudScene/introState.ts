import * as THREE from 'three';

export const INTRO_DURATION = 3.4;
export const INTRO_EXPOSURE = 0.82;
export const INTRO_CAMERA_POS: [number, number, number] = [0, 28, 26];
export const INTRO_LOOK_AT: [number, number, number] = [0, 6, -110];

let introProgress = 0;
let introEnabled = true;

export function setIntroEnabled(enabled: boolean): void {
  introEnabled = enabled;
  if (!enabled) introProgress = 1;
}

export function getIntroProgress(): number {
  return introProgress;
}

export function setIntroProgress(value: number): void {
  introProgress = THREE.MathUtils.clamp(value, 0, 1);
}

export function isIntroComplete(): boolean {
  return !introEnabled || introProgress >= 1;
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Staggered 0→1 reveal between normalized intro milestones. */
export function introStage(progress: number, start: number, end: number): number {
  return THREE.MathUtils.smoothstep(progress, start, end);
}

export function introParallaxMix(progress: number): number {
  return introStage(progress, 0.72, 1);
}

export function introStarsMix(progress: number): number {
  return introStage(progress, 0.08, 0.52);
}

export function introOceanMix(progress: number): number {
  return introStage(progress, 0.18, 0.68);
}

export function introCloudMix(progress: number): number {
  return introStage(progress, 0.38, 0.88);
}
