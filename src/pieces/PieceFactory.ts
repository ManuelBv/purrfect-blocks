// Factory for creating pieces

import { Piece } from './Piece';
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

  createMultiplePieces(count: number): Piece[] {
    const pieces: Piece[] = [];
    for (let i = 0; i < count; i++) {
      pieces.push(this.createRandomPiece());
    }
    return pieces;
  }
}
