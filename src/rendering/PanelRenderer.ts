// Renders the 3-piece selection panel

import type { Piece } from '../pieces/Piece';
import { PieceRenderer } from './PieceRenderer';
import { COLORS, UI_COLORS } from '../utils/Colors';

export class PanelRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private readonly SLOTS = 3;
  private pieceSpacing: number; // Spacing between pieces (responsive)
  private readonly MAX_PIECE_SIZE = 4; // Max piece dimension (limited to 4x4 for mobile)
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvas: HTMLCanvasElement, cellSize: number) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2d context for panel');
    }
    this.ctx = context;

    // Responsive spacing: tighter on smaller screens
    // All layouts are now horizontal (1 row) to fit within board width
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;

    // Mobile: 30% smaller pieces with tighter spacing to fit on screen
    // Desktop: Normal spacing
    if (isMobile) {
      this.pieceSpacing = 2; // Tight spacing for mobile
      this.cellSize = cellSize * 0.70; // 30% smaller pieces
    } else {
      this.pieceSpacing = 28;
      this.cellSize = cellSize;
    }

    // Calculate canvas dimensions for horizontal layout
    const maxPieceWidth = this.MAX_PIECE_SIZE * this.cellSize;

    // Horizontal layout: pieces side by side in 1 row
    this.canvasWidth = maxPieceWidth * this.SLOTS + this.pieceSpacing * (this.SLOTS - 1);
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

      // Horizontal layout: stack horizontally, center vertically
      const centerX = (maxPieceWidth / 2) + i * (maxPieceWidth + this.pieceSpacing);
      const centerY = this.canvasHeight / 2;

      PieceRenderer.renderPieceCentered(this.ctx, piece, centerX, centerY, this.cellSize);
    }
  }

  getSlotIndexFromCoordinates(x: number, y: number): number {
    const maxPieceWidth = this.MAX_PIECE_SIZE * this.cellSize;

    // Horizontal layout: check which horizontal slot was clicked
    if (y < 0 || y > this.canvasHeight) {
      return -1;
    }

    for (let i = 0; i < this.SLOTS; i++) {
      const slotStartX = i * (maxPieceWidth + this.pieceSpacing);
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
