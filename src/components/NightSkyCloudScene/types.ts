import type { Vector2 } from 'three';

export interface NightSkyCloudSceneProps {
  className?: string;
  style?: React.CSSProperties;
  /** Number of floating cloud icons (default: 8) */
  cloudCount?: number;
  /** Number of stars in the distant field (default: 2000) */
  starCount?: number;
  /** Enable mouse/touch parallax and cloud hover glow (default: true) */
  interactive?: boolean;
  /** Subtle ambient camera drift (default: false) */
  autoRotate?: boolean;
  /** Animate camera and elements in on mount (default: true) */
  introAnimation?: boolean;
}

export interface ParallaxState {
  pointer: Vector2;
  target: Vector2;
  /** NDC pointer velocity — drives ocean ripples */
  pointerVel: Vector2;
}

export interface CloudLayout {
  position: [number, number, number];
  scale: number;
  phase: number;
  rotationSpeed: number;
}

/** Moonlit cloud grey — visible against dark sky */
export const CLOUD_COLOR = '#7a8898';

/** Ocean surface color */
export const OCEAN_COLOR = '#194bcd';

export const SKY_FOG_COLOR = '#020818';

/** #194bcd as linear RGB for shaders */
export const OCEAN_COLOR_RGB: [number, number, number] = [25 / 255, 75 / 255, 205 / 255];
