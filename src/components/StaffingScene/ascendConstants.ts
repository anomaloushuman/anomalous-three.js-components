import { GRID_FLOOR_Y } from './gridConstants';

/** Vertical corridor for endless ascent */
export const SPAWN_Y = GRID_FLOOR_Y + 0.08;
export const DESPAWN_Y = 52;
export const ASCEND_SPEED_MIN = 0.55;
export const ASCEND_SPEED_MAX = 1.15;

/** Soft fade-in / fade-out bands (world Y) */
export const APPEAR_DURATION = 1.25;
export const EXIT_FADE_START = DESPAWN_Y - 7;

/** Scene-load intro: pieces materialize onto the grid before ascending */
export const INTRO_PIECE_DELAY = 0.55;
export const INTRO_PIECE_STAGGER = 0.22;

/**
 * Floor carpet bounds — wide enough to reach the visible left/right edges
 * and deep enough to reach toward the horizon.
 */
export const SPAWN_X_SPAN = 84;
export const SPAWN_Z_NEAR = -48;
export const SPAWN_Z_FAR = -180;

/** Sparse count — capped by unique camera view-lanes in practice */
export const DEFAULT_PEOPLE_COUNT = 10;

export const ICON_SIZE = 1.0;
