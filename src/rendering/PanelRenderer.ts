// Renders the 3-piece selection panel

import type { Piece } from '../pieces/Piece';
import { PieceRenderer } from './PieceRenderer';
import { COLORS, UI_COLORS } from '../utils/Colors';

export class PanelRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private readonly SLOTS = 3;
  private pieceSpacing: number; // Spacing between pieces (responsive)
  private readonly MAX_PIECE_SIZE = 6; // Max piece dimension
  private canvasWidth: number;
  private canvasHeight: number;
  private isVerticalLayout: boolean; // Vertical on mobile, horizontal on desktop

  constructor(canvas: HTMLCanvasElement, cellSize: number) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2d context for panel');
    }
    this.ctx = context;

    // Responsive spacing: tighter on smaller screens
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;
    this.isVerticalLayout = isMobile;

    // Very small screens (320px): 8px spacing, 25% larger pieces, vertical
    // Mobile (< 768px): 12px spacing, vertical layout
    // Desktop: 40px spacing, horizontal layout
    if (screenWidth <= 380) {
      this.pieceSpacing = 8;
      this.cellSize = cellSize * 1.25; // 25% larger for easier touch
    } else if (isMobile) {
      this.pieceSpacing = 12;
      this.cellSize = cellSize;
    } else {
      this.pieceSpacing = 40;
      this.cellSize = cellSize;
    }

    // Calculate canvas dimensions based on layout
    const maxPieceWidth = this.MAX_PIECE_SIZE * this.cellSize;

    if (this.isVerticalLayout) {
      // Vertical layout: pieces stacked on top of each other
      this.canvasWidth = maxPieceWidth;
      this.canvasHeight = maxPieceWidth * this.SLOTS + this.pieceSpacing * (this.SLOTS - 1);
    } else {
      // Horizontal layout: pieces side by side
      this.canvasWidth = maxPieceWidth * this.SLOTS + this.pieceSpacing * (this.SLOTS - 1);
      this.canvasHeight = maxPieceWidth;
    }

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
      let centerX: number;
      let centerY: number;

      if (this.isVerticalLayout) {
        // Vertical layout: center horizontally, stack vertically
        centerX = this.canvasWidth / 2;
        centerY = (maxPieceWidth / 2) + i * (maxPieceWidth + this.pieceSpacing);
      } else {
        // Horizontal layout: stack horizontally, center vertically
        centerX = (maxPieceWidth / 2) + i * (maxPieceWidth + this.pieceSpacing);
        centerY = this.canvasHeight / 2;
      }

      PieceRenderer.renderPieceCentered(this.ctx, piece, centerX, centerY, this.cellSize);
    }
  }

  getSlotIndexFromCoordinates(x: number, y: number): number {
    const maxPieceWidth = this.MAX_PIECE_SIZE * this.cellSize;

    if (this.isVerticalLayout) {
      // Vertical layout: check which vertical slot was clicked
      if (x < 0 || x > this.canvasWidth) {
        return -1;
      }

      for (let i = 0; i < this.SLOTS; i++) {
        const slotStartY = i * (maxPieceWidth + this.pieceSpacing);
        const slotEndY = slotStartY + maxPieceWidth;

        if (y >= slotStartY && y < slotEndY) {
          return i;
        }
      }
    } else {
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
    }

    return -1;
  }

  getCellSize(): number {
    return this.cellSize;
  }
}
