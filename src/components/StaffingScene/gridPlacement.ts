import {
  GRID_CELL_CENTER_OFFSET,
  GRID_MAJOR_CELL,
  SPAWN_CELL_STRIDE,
} from './gridConstants';
import { SPAWN_X_SPAN, SPAWN_Z_FAR, SPAWN_Z_NEAR } from './ascendConstants';
import { CAMERA_POS } from '../NightSkyCloudScene/sceneConstants';

export interface GridCell {
  x: number;
  z: number;
}

export function cellKey(cell: Pick<GridCell, 'x' | 'z'>): string {
  return `${cell.x},${cell.z}`;
}

/** True when a world X/Z sits at a major 4×4 cell center. */
export function isMajorCellCenter(value: number): boolean {
  const delta = value - GRID_CELL_CENTER_OFFSET;
  const mod = ((delta % GRID_MAJOR_CELL) + GRID_MAJOR_CELL) % GRID_MAJOR_CELL;
  return mod < 1e-6 || Math.abs(mod - GRID_MAJOR_CELL) < 1e-6;
}

/**
 * Camera sightline bin — pieces in the same lane sit in front of each other on screen.
 * One active piece per lane prevents depth occlusion.
 */
export function viewLane(cell: Pick<GridCell, 'x' | 'z'>): number {
  const depth = Math.max(8, CAMERA_POS[2] - cell.z);
  return Math.round((cell.x / depth) * 32);
}

/**
 * Lattice of major-cell centers — exactly where glowing major grid lines form 4×4 squares.
 * Centers are at …, -18, -6, 6, 18, … (offset by half a major cell from the origin).
 */
export function buildSpawnCells(): GridCell[] {
  const cells: GridCell[] = [];
  const idxStride = SPAWN_CELL_STRIDE;

  const xMinIdx = Math.ceil((-SPAWN_X_SPAN - GRID_CELL_CENTER_OFFSET) / GRID_MAJOR_CELL);
  const xMaxIdx = Math.floor((SPAWN_X_SPAN - GRID_CELL_CENTER_OFFSET) / GRID_MAJOR_CELL);
  const zNearIdx = Math.floor((SPAWN_Z_NEAR - GRID_CELL_CENTER_OFFSET) / GRID_MAJOR_CELL);
  const zFarIdx = Math.ceil((SPAWN_Z_FAR - GRID_CELL_CENTER_OFFSET) / GRID_MAJOR_CELL);

  const xStart = Math.ceil(xMinIdx / idxStride) * idxStride;
  const zStart = Math.floor(zNearIdx / idxStride) * idxStride;

  for (let zi = zStart; zi >= zFarIdx; zi -= idxStride) {
    for (let xi = xStart; xi <= xMaxIdx; xi += idxStride) {
      cells.push({
        x: xi * GRID_MAJOR_CELL + GRID_CELL_CENTER_OFFSET,
        z: zi * GRID_MAJOR_CELL + GRID_CELL_CENTER_OFFSET,
      });
    }
  }

  return cells;
}

/**
 * Pick unique cells that also use unique camera view-lanes,
 * alternating near/far depth so the field reads across the floor.
 */
export function distributeSpawnCells(cells: GridCell[], count: number): GridCell[] {
  if (cells.length === 0 || count <= 0) return [];

  const byLane = new Map<number, GridCell[]>();
  for (const cell of cells) {
    const lane = viewLane(cell);
    const list = byLane.get(lane) ?? [];
    list.push(cell);
    byLane.set(lane, list);
  }

  for (const list of byLane.values()) {
    list.sort((a, b) => b.z - a.z); // near → far
  }

  const lanes = [...byLane.keys()].sort((a, b) => a - b);
  const target = Math.min(count, lanes.length);
  const picks: GridCell[] = [];
  const usedCells = new Set<string>();

  for (let i = 0; i < target; i++) {
    const laneIdx =
      target === 1 ? Math.floor(lanes.length / 2) : Math.round((i * (lanes.length - 1)) / (target - 1));
    const lane = lanes[laneIdx]!;
    const options = byLane.get(lane) ?? [];

    const depthPick = i % 3 === 0 ? 0 : i % 3 === 1 ? Math.floor(options.length / 2) : options.length - 1;
    let chosen: GridCell | null = null;

    for (let offset = 0; offset < options.length; offset++) {
      const cell = options[(depthPick + offset) % options.length]!;
      const key = cellKey(cell);
      if (usedCells.has(key)) continue;
      chosen = cell;
      break;
    }

    if (!chosen) continue;
    usedCells.add(cellKey(chosen));
    picks.push(chosen);
  }

  return picks;
}

/** Free cell that also doesn't sit in an occupied camera lane. */
export function pickFreeSpawnCell(
  cells: GridCell[],
  occupiedCells: Set<string>,
  occupiedLanes: Set<number>,
  rand: () => number,
): GridCell | null {
  const free = cells.filter((cell) => {
    if (occupiedCells.has(cellKey(cell))) return false;
    if (occupiedLanes.has(viewLane(cell))) return false;
    return true;
  });
  if (free.length === 0) return null;
  return free[Math.floor(rand() * free.length)]!;
}
