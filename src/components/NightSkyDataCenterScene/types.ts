export interface NightSkyDataCenterSceneProps {
  className?: string;
  style?: React.CSSProperties;
  /** Number of stars in the distant field (default: 2500) */
  starCount?: number;
  /** Enable mouse/touch parallax (default: true) */
  interactive?: boolean;
  /** Subtle ambient camera drift (default: false) */
  autoRotate?: boolean;
  /** Animate camera and elements in on mount (default: true) */
  introAnimation?: boolean;
}

/** Datacenter chassis — dark blue-grey metal */
export const RACK_BODY_COLOR = '#2a3344';

/** Primary network / activity glow — matches ocean accent */
export const DC_ACCENT_COLOR = '#194bcd';

/** Status LED colors */
export const LED_CYAN = '#40c8ff';
export const LED_GREEN = '#4ade80';
export const LED_AMBER = '#fbbf24';

/** Platform slab */
export const PLATFORM_COLOR = '#1a2538';

/** Cloud shroud around the floating facility */
export const DC_CLOUD_COLOR = '#7a8898';
