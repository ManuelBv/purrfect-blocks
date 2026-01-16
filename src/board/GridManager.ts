// Grid operations and utilities

import type { Position } from '../types/GameTypes';
import type { PieceShape } from '../types/PieceTypes';
import { Cell } from './Cell';

export class GridManager {
  static isValidPosition(
    row: number,
    col: number,
    rows: number,
    cols: number
  ): boolean {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  }

  static canPlacePiece(
    cells: Cell[][],
    piece: PieceShape,
    startRow: number,
    startCol: number
  ): boolean {
    const rows = cells.length;
    const cols = cells[0].length;

    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c]) {
          const boardRow = startRow + r;
          const boardCol = startCol + c;

          // Check bounds
          if (!this.isValidPosition(boardRow, boardCol, rows, cols)) {
            return false;
          }

          // Check if cell is occupied
          if (cells[boardRow][boardCol].occupied) {
            return false;
          }
        }
      }
    }

    return true;
  }

  static getOccupiedPositions(piece: PieceShape, startRow: number, startCol: number): Position[] {
    const positions: Position[] = [];

    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c]) {
          positions.push({
            row: startRow + r,
            col: startCol + c,
          });
        }
      }
    }

    return positions;
  }
}
