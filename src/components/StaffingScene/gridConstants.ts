/** Must match DigitalGrid shader cell sizes (lines at multiples of cell). */
export const GRID_MINOR_CELL = 3;
export const GRID_MAJOR_CELL = 12;
export const GRID_FLOOR_Y = -0.5;

/**
 * A 4×4 block of minor cells = one major cell.
 * Line intersections form major squares; piece sits at the square center.
 */
export const PIECE_GRID_CELLS = 4;
export const PIECE_FOOTPRINT = GRID_MINOR_CELL * PIECE_GRID_CELLS;

/** Centers of major cells are halfway between major lines: …, -18, -6, 6, 18, … */
export const GRID_CELL_CENTER_OFFSET = GRID_MAJOR_CELL / 2;

/** Snap a world X/Z to the center of the nearest major (4×4) grid square. */
export function snapToMajorCellCenter(value: number): number {
  return (
    Math.round((value - GRID_CELL_CENTER_OFFSET) / GRID_MAJOR_CELL) * GRID_MAJOR_CELL +
    GRID_CELL_CENTER_OFFSET
  );
}

/** Leave empty major cells between pieces so footprints don’t share an edge. */
export const SPAWN_CELL_STRIDE = 3;
