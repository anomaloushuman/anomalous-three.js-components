import * as THREE from 'three';

/** World-X corridor for the jet stream (extends beyond the visible frustum). */
export const STREAM_X_MIN = -82;
export const STREAM_X_MAX = 82;
export const STREAM_X_SPAN = STREAM_X_MAX - STREAM_X_MIN;

/** Opacity ramps at the left (entry) and right (exit) of the corridor. */
export const STREAM_FADE_IN_START = -78;
export const STREAM_FADE_IN_END = -48;
export const STREAM_FADE_OUT_START = 48;
export const STREAM_FADE_OUT_END = 78;

/** Smooth 0→1 opacity for world X — clouds fade before wrapping. */
export function streamEdgeOpacity(x: number): number {
  const fadeIn = THREE.MathUtils.smoothstep(x, STREAM_FADE_IN_START, STREAM_FADE_IN_END);
  const fadeOut = 1 - THREE.MathUtils.smoothstep(x, STREAM_FADE_OUT_START, STREAM_FADE_OUT_END);
  return fadeIn * fadeOut;
}

/** Reposition drift so the cloud re-enters from the opposite corridor edge. */
export function applyStreamWrap(baseX: number, driftX: number): number {
  let d = driftX;
  let x = baseX + d;

  while (x > STREAM_X_MAX && streamEdgeOpacity(x) < 0.02) {
    d -= STREAM_X_SPAN;
    x = baseX + d;
  }
  while (x < STREAM_X_MIN && streamEdgeOpacity(x) < 0.02) {
    d += STREAM_X_SPAN;
    x = baseX + d;
  }

  return d;
}
