import { GRID_FLOOR_Y } from './gridConstants';

/** Vertical corridor for endless ascent */
export const SPAWN_Y = GRID_FLOOR_Y + 0.08;
export const DESPAWN_Y = 40;
export const ASCEND_SPEED_MIN = 0.42;
export const ASCEND_SPEED_MAX = 0.78;

/** Soft fade-in / fade-out bands (world Y) */
export const APPEAR_DURATION = 0.7;
export const EXIT_FADE_START = DESPAWN_Y - 5;

/** Scene-load intro: pieces materialize onto the grid before ascending */
export const INTRO_PIECE_DELAY = 0.25;
export const INTRO_PIECE_STAGGER = 0.1;

/**
 * Floor carpet bounds — wide enough to reach the visible left/right edges
 * and deep enough to reach toward the horizon.
 */
export const SPAWN_X_SPAN = 84;
export const SPAWN_Z_NEAR = -48;
export const SPAWN_Z_FAR = -180;

/** Concurrent pieces — higher count = more frequent visible spawns */
export const DEFAULT_PEOPLE_COUNT = 14;

export const ICON_SIZE = 1.0;
