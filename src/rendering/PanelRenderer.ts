// Renders the 3-piece selection panel

import type { Piece } from '../pieces/Piece';
import { PieceRenderer } from './PieceRenderer';
import { COLORS, UI_COLORS } from '../utils/Colors';

export class PanelRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private slotWidth: number;
  private slotHeight: number;
  private readonly SLOTS = 3;
  private readonly PADDING = 20;

  constructor(canvas: HTMLCanvasElement, cellSize: number) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2d context for panel');
    }
    this.ctx = context;
    this.cellSize = cellSize;

    // Calculate slot dimensions (each can fit a 6x6 piece)
    this.slotWidth = cellSize * 8; // 6 cells + padding
    this.slotHeight = cellSize * 8;

    // Setup canvas size
    canvas.width = this.slotWidth * this.SLOTS + this.PADDING * (this.SLOTS + 1);
    canvas.height = this.slotHeight + this.PADDING * 2;
  }

  render(pieces: Piece[], selectedIndex: number): void {
    this.clear();
    this.drawSlots(selectedIndex);
    this.drawPieces(pieces);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Background
    this.ctx.fillStyle = COLORS.CREAM;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private drawSlots(selectedIndex: number): void {
    for (let i = 0; i < this.SLOTS; i++) {
      const x = this.PADDING + i * (this.slotWidth + this.PADDING);
      const y = this.PADDING;

      // Slot background
      if (i === selectedIndex) {
        this.ctx.fillStyle = 'rgba(76, 175, 80, 0.2)'; // Green tint for selected
        this.ctx.strokeStyle = UI_COLORS.VALID_PLACEMENT;
        this.ctx.lineWidth = 3;
      } else {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.strokeStyle = UI_COLORS.GRID_LINE;
        this.ctx.lineWidth = 2;
      }

      this.ctx.fillRect(x, y, this.slotWidth, this.slotHeight);
      this.ctx.strokeRect(x, y, this.slotWidth, this.slotHeight);
    }
  }

  private drawPieces(pieces: Piece[]): void {
    for (let i = 0; i < Math.min(pieces.length, this.SLOTS); i++) {
      const piece = pieces[i];
      const centerX = this.PADDING + i * (this.slotWidth + this.PADDING) + this.slotWidth / 2;
      const centerY = this.PADDING + this.slotHeight / 2;

      PieceRenderer.renderPieceCentered(this.ctx, piece, centerX, centerY, this.cellSize);
    }
  }

  getSlotIndexFromCoordinates(x: number, y: number): number {
    // Check if click is within panel bounds
    if (y < this.PADDING || y > this.PADDING + this.slotHeight) {
      return -1;
    }

    for (let i = 0; i < this.SLOTS; i++) {
      const slotX = this.PADDING + i * (this.slotWidth + this.PADDING);
      if (x >= slotX && x < slotX + this.slotWidth) {
        return i;
      }
    }

    return -1;
  }

  getCellSize(): number {
    return this.cellSize;
  }
}
