import type { ChessKind } from './chessModels';

/** Relative ascend feel per piece — pawns quicker, rooks slower / more majestic. */
export const PIECE_SPEED_MUL: Record<ChessKind, [number, number]> = {
  pawn: [1.25, 1.55],
  knight: [1.0, 1.25],
  bishop: [0.85, 1.05],
  rook: [0.55, 0.75],
};

export const PIECE_SPIN_MUL: Record<ChessKind, number> = {
  pawn: 1.15,
  knight: 1.0,
  bishop: 0.85,
  rook: 0.55,
};

export function kindForId(id: number): ChessKind {
  return (['pawn', 'rook', 'bishop', 'knight'] as const)[id % 4]!;
}
