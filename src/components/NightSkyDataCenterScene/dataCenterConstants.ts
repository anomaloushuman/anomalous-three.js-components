import { OCEAN_Y } from '../NightSkyCloudScene/sceneConstants';

/**
 * Ocean grid rhythm — locked to binaryStreams spacing at datacenter distance
 */
export const OCEAN_GRID_ROW_SPACING = 2.0;
export const OCEAN_GRID_COL_SPACING = 2.05;

/** Facility rooted on the digital ocean surface */
export const DATA_CENTER_POSITION: [number, number, number] = [0, OCEAN_Y, -42];

export const RACK_WIDTH = 1.65;
export const RACK_HEIGHT = 3.4;
export const RACK_DEPTH = 1.1;
export const RACK_SPACING_X = OCEAN_GRID_COL_SPACING;
export const RACK_SPACING_Z = OCEAN_GRID_ROW_SPACING;

/** One repeating tile of the endless aisle */
export const GRID_ROWS = 5;
export const GRID_COLS_PER_SEGMENT = 8;
export const GRID_DETAIL_COUNT = 5;

export const SEGMENT_WIDTH = GRID_COLS_PER_SEGMENT * RACK_SPACING_X;

/** Deck / hologram span every visible segment */
export const AISLE_WIDTH = SEGMENT_WIDTH * 5 + 2;
export const PLATFORM_WIDTH = AISLE_WIDTH;
export const PLATFORM_DEPTH = (GRID_ROWS - 1) * RACK_SPACING_Z + RACK_DEPTH + 1.4;
export const PLATFORM_HEIGHT = 0.14;

export const RACK_FLOOR_Y = PLATFORM_HEIGHT + 0.03;

export const GRID_FRONT_Z = 0.5;
export const GRID_CENTER_Z = GRID_FRONT_Z - ((GRID_ROWS - 1) * RACK_SPACING_Z) / 2;
export const GRID_BACK_Z = GRID_FRONT_Z - (GRID_ROWS - 1) * RACK_SPACING_Z;

export const DC_OCEAN_ANCHOR_RIPPLE = 0.32;

/** Camera — dolly alongside the front row */
export const DC_CAMERA_HEIGHT = RACK_HEIGHT * 1.34;
export const DC_CAMERA_Z = 12;
export const DC_CAMERA_SPEED = 0.32;
export const DC_LOOK_AHEAD = 10;
export const DC_LOOK_AT_Y = RACK_HEIGHT * 0.58;
export const DC_LOOK_AT_Z = GRID_CENTER_Z - 0.6;

export const DC_CAMERA_POS: [number, number, number] = [0, OCEAN_Y + DC_CAMERA_HEIGHT, DATA_CENTER_POSITION[2] + DC_CAMERA_Z];
export const DC_CAMERA_LOOK_AT: [number, number, number] = [DC_LOOK_AHEAD, OCEAN_Y + DC_LOOK_AT_Y, DATA_CENTER_POSITION[2] + DC_LOOK_AT_Z];

export const DC_INTRO_CAMERA_POS: [number, number, number] = [-16, 9, 8];
export const DC_INTRO_LOOK_AT: [number, number, number] = [2, OCEAN_Y + 2.8, -38];
