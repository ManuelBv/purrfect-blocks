// Factory for creating pieces

import { Piece } from './Piece';
import { BombPiece } from './BombPiece';
import { PIECE_DEFINITIONS } from './PieceDefinitions';

export class PieceFactory {
  createRandomPiece(): Piece {
    const randomIndex = Math.floor(Math.random() * PIECE_DEFINITIONS.length);
    return new Piece(PIECE_DEFINITIONS[randomIndex]);
  }

  createPieceByIndex(index: number): Piece {
    if (index < 0 || index >= PIECE_DEFINITIONS.length) {
      throw new Error(`Invalid piece index: ${index}`);
    }
    return new Piece(PIECE_DEFINITIONS[index]);
  }

  createBombPiece(): BombPiece {
    return new BombPiece();
  }

  /**
   * Create pieces with optional bomb replacement based on combo multiplier
   * @param count Number of pieces to create
   * @param comboMultiplier Current combo multiplier (1.0 = no combo, 1.5 = 1.5x, etc.)
   * @returns Array of pieces with potential bomb replacement
   */
  createMultiplePieces(count: number, comboMultiplier: number = 1.0): Piece[] {
    const pieces: Piece[] = [];
    for (let i = 0; i < count; i++) {
      pieces.push(this.createRandomPiece());
    }

    // Replace one random piece with bomb if combo >= 1.5x
    if (comboMultiplier >= 1.5 && pieces.length > 0) {
      const replaceIndex = Math.floor(Math.random() * pieces.length);
      pieces[replaceIndex] = this.createBombPiece();
    }

    return pieces;
  }
}
