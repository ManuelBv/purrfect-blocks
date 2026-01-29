// Manages 3-piece selection panel

import { PieceFactory } from '../pieces/PieceFactory';
import { Piece } from '../pieces/Piece';
import { PIECE_CONFIG } from '../utils/Constants';
import type { GameBoard } from './GameBoard';

export class PieceManager {
  private factory: PieceFactory;
  private availablePieces: Piece[];
  private selectedIndex: number = -1;
  private turnsSinceLastBomb: number = 0;
  private turnsUntilNextBomb: number = this.randomTurnsUntilBomb();

  constructor() {
    this.factory = new PieceFactory();
    this.availablePieces = this.factory.createMultiplePieces(PIECE_CONFIG.PANEL_SIZE);
  }

  private randomTurnsUntilBomb(): number {
    // Random number between 3 and 5 (inclusive)
    return Math.floor(Math.random() * 3) + 3;
  }

  getAvailablePieces(): Piece[] {
    return this.availablePieces;
  }

  selectPiece(index: number): Piece | null {
    if (index < 0 || index >= this.availablePieces.length) {
      return null;
    }

    this.selectedIndex = index;
    return this.availablePieces[index];
  }

  consumePiece(index: number, comboMultiplier: number = 1.0): Piece | null {
    if (index < 0 || index >= this.availablePieces.length) {
      return null;
    }

    const piece = this.availablePieces[index];

    // Increment turn counter
    this.turnsSinceLastBomb++;

    // Check if it's time to spawn a bomb
    const shouldSpawnBomb = this.turnsSinceLastBomb >= this.turnsUntilNextBomb;

    if (shouldSpawnBomb) {
      // Reset counters and spawn bomb
      this.turnsSinceLastBomb = 0;
      this.turnsUntilNextBomb = this.randomTurnsUntilBomb();
      this.availablePieces[index] = this.factory.createBombPiece();
    } else {
      // Create a normal random piece
      this.availablePieces[index] = this.factory.createRandomPiece();
    }

    this.selectedIndex = -1;

    return piece;
  }

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  clearSelection(): void {
    this.selectedIndex = -1;
  }

  hasAvailablePieces(): boolean {
    return this.availablePieces.length > 0;
  }

  /**
   * Check if any of the available pieces can be placed anywhere on the board
   */
  hasPlayablePieces(board: GameBoard): boolean {
    for (const piece of this.availablePieces) {
      // Try to place this piece at every position on the board
      for (let row = 0; row < 18; row++) {
        for (let col = 0; col < 12; col++) {
          if (board.canPlacePiece(piece.shape, row, col)) {
            return true; // Found at least one valid placement
          }
        }
      }
    }
    return false; // No pieces can be placed anywhere
  }

  reset(): void {
    this.availablePieces = this.factory.createMultiplePieces(PIECE_CONFIG.PANEL_SIZE);
    this.selectedIndex = -1;
    this.turnsSinceLastBomb = 0;
    this.turnsUntilNextBomb = this.randomTurnsUntilBomb();
  }
}
