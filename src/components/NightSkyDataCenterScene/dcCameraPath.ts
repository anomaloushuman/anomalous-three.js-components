import { SEGMENT_WIDTH } from './dataCenterConstants';

/** Shared camera dolly state — read by cluster scroll + ocean sync */
export const dcCameraPath = {
  x: 0,
  scrollX: 0,
};

/** Visible repeating segments centered on the camera */
export const VISIBLE_SEGMENTS = 5;

export function getScrollMod(scrollX: number): number {
  return ((scrollX % SEGMENT_WIDTH) + SEGMENT_WIDTH) % SEGMENT_WIDTH;
}

/** Local X for segment index 0 … VISIBLE_SEGMENTS−1 (fixed layout inside scroll group) */
export function segmentLocalX(index: number): number {
  const center = (VISIBLE_SEGMENTS - 1) / 2;
  return (index - center) * SEGMENT_WIDTH;
}

/** World X anchor for ocean ripple — follows the traveling aisle */
export function aisleWorldX(): number {
  return dcCameraPath.x;
}
