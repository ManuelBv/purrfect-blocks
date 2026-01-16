// Manages 3-piece selection panel

import { PieceFactory } from '../pieces/PieceFactory';
import { Piece } from '../pieces/Piece';
import { PIECE_CONFIG } from '../utils/Constants';

export class PieceManager {
  private factory: PieceFactory;
  private availablePieces: Piece[];
  private selectedIndex: number = -1;

  constructor() {
    this.factory = new PieceFactory();
    this.availablePieces = this.factory.createMultiplePieces(PIECE_CONFIG.PANEL_SIZE);
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

  consumePiece(index: number): Piece | null {
    if (index < 0 || index >= this.availablePieces.length) {
      return null;
    }

    const piece = this.availablePieces[index];

    // Replace consumed piece with new one
    this.availablePieces[index] = this.factory.createRandomPiece();
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

  reset(): void {
    this.availablePieces = this.factory.createMultiplePieces(PIECE_CONFIG.PANEL_SIZE);
    this.selectedIndex = -1;
  }
}
