// Renders the 3-piece selection panel

import type { Piece } from '../pieces/Piece';
import { PieceRenderer } from './PieceRenderer';
import { COLORS, UI_COLORS } from '../utils/Colors';

export class PanelRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private readonly SLOTS = 3;
  private readonly PIECE_SPACING = 40; // Spacing between pieces
  private readonly MAX_PIECE_SIZE = 6; // Max piece dimension
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvas: HTMLCanvasElement, cellSize: number) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2d context for panel');
    }
    this.ctx = context;
    this.cellSize = cellSize;

    // Calculate canvas dimensions based on max piece size
    const maxPieceWidth = this.MAX_PIECE_SIZE * cellSize;
    this.canvasWidth = maxPieceWidth * this.SLOTS + this.PIECE_SPACING * (this.SLOTS - 1);
    this.canvasHeight = maxPieceWidth;

    // Setup canvas size
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
  }

  render(pieces: Piece[], selectedIndex: number): void {
    this.clear();
    this.drawPieces(pieces);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private drawPieces(pieces: Piece[]): void {
    const maxPieceWidth = this.MAX_PIECE_SIZE * this.cellSize;

    for (let i = 0; i < Math.min(pieces.length, this.SLOTS); i++) {
      const piece = pieces[i];
      // Calculate center position for each piece
      const centerX = (maxPieceWidth / 2) + i * (maxPieceWidth + this.PIECE_SPACING);
      const centerY = this.canvasHeight / 2;

      PieceRenderer.renderPieceCentered(this.ctx, piece, centerX, centerY, this.cellSize);
    }
  }

  getSlotIndexFromCoordinates(x: number, y: number): number {
    const maxPieceWidth = this.MAX_PIECE_SIZE * this.cellSize;

    // Check if click is within panel bounds vertically
    if (y < 0 || y > this.canvasHeight) {
      return -1;
    }

    // Check which slot was clicked
    for (let i = 0; i < this.SLOTS; i++) {
      const slotStartX = i * (maxPieceWidth + this.PIECE_SPACING);
      const slotEndX = slotStartX + maxPieceWidth;

      if (x >= slotStartX && x < slotEndX) {
        return i;
      }
    }

    return -1;
  }

  getCellSize(): number {
    return this.cellSize;
  }
}
