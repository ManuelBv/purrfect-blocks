// Collision detection for piece placement

import type { PieceShape } from '../types/PieceTypes';
import { Cell } from './Cell';
import { GridManager } from './GridManager';

export class CollisionDetector {
  static canPlace(
    cells: Cell[][],
    piece: PieceShape,
    row: number,
    col: number
  ): boolean {
    return GridManager.canPlacePiece(cells, piece, row, col);
  }

  static hasValidPlacement(cells: Cell[][], piece: PieceShape): boolean {
    const rows = cells.length;
    const cols = cells[0].length;

    // Try every position on the board
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (this.canPlace(cells, piece, row, col)) {
          return true;
        }
      }
    }

    return false;
  }
}
