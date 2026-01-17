// Bomb piece (yarn ball) - explodes 3x3 area on placement

import { Piece } from './Piece';
import { PieceType } from '../types/PieceTypes';
import type { PieceDefinition } from '../types/PieceTypes';

export class BombPiece extends Piece {
  readonly isBomb: boolean = true;

  constructor() {
    const definition: PieceDefinition = {
      type: PieceType.BOMB,
      shape: [[true]], // 1x1 piece
      color: '#8B4513', // Saddle brown for yarn ball
      rotation: 0,
      size: 1,
    };
    super(definition);
  }

  /**
   * Get cells to explode in a 3x3 area around placement position
   * @param centerRow Row where bomb was placed
   * @param centerCol Column where bomb was placed
   * @returns Array of {row, col} coordinates to clear
   */
  getExplosionCells(centerRow: number, centerCol: number): Array<{row: number, col: number}> {
    const cells: Array<{row: number, col: number}> = [];

    // 3x3 explosion centered on placement
    for (let r = centerRow - 1; r <= centerRow + 1; r++) {
      for (let c = centerCol - 1; c <= centerCol + 1; c++) {
        // Bounds checking will be done by caller
        cells.push({ row: r, col: c });
      }
    }

    return cells;
  }
}
