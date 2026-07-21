import { OCEAN_COLOR, SKY_FOG_COLOR } from '../NightSkyCloudScene/types';
import { DC_ACCENT_COLOR } from '../NightSkyDataCenterScene/types';
import type { ChessKind } from './chessModels';

/** Grid / void — shared with night-sky ocean & fog */
export const GRID_LINE_COLOR = OCEAN_COLOR;
export const GRID_GLOW_COLOR = DC_ACCENT_COLOR;
export const GRID_VOID = SKY_FOG_COLOR;

/**
 * Clay people blue — matches the supplied 3D UI icon reference.
 * Lifted slightly so silhouettes stay clear over the ocean-blue grid.
 */
export const PEOPLE_COLOR = '#3b82f6';
export const PEOPLE_EMISSIVE = '#2563eb';

export interface StaffingSceneProps {
  className?: string;
  style?: React.CSSProperties;
  /**
   * Number of simultaneously floating pieces (default: 14).
   * Alias of `maxActivePieces`.
   */
  peopleCount?: number;
  /**
   * Max concurrent pieces on screen (default: 14).
   * Prefer this when tuning density; falls back to `peopleCount`.
   */
  maxActivePieces?: number;
  /** Enable mouse/touch camera parallax (default: true) */
  interactive?: boolean;
  /** Subtle ambient camera drift (default: false) */
  autoRotate?: boolean;
  /** Animate camera and elements in on mount (default: true) */
  introAnimation?: boolean;
}

export interface PersonSlot {
  id: number;
  kind: ChessKind;
  x: number;
  y: number;
  z: number;
  scale: number;
  phase: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  /** Base yaw at spawn (radians) */
  yaw: number;
  /** Subtle resting tilt (radians) */
  tilt: number;
  /** Spin speed multiplier from piece type */
  spinMul: number;
  appear: number;
  /** Seconds before this piece begins ascending from the grid */
  spawnDelay: number;
}
