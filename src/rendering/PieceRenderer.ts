// Renders individual pieces

import type { Piece } from '../pieces/Piece';
import type { PieceShape } from '../types/PieceTypes';

export class PieceRenderer {
  static renderPiece(
    ctx: CanvasRenderingContext2D,
    piece: Piece,
    x: number,
    y: number,
    cellSize: number,
    alpha: number = 1.0
  ): void {
    ctx.save();
    ctx.globalAlpha = alpha;

    const shape = piece.shape;
    const color = piece.color;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const px = x + c * cellSize;
          const py = y + r * cellSize;

          // Draw cell with slight border
          ctx.fillStyle = color;
          ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

          // Add subtle border for depth
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        }
      }
    }

    ctx.restore();
  }

  static getPieceDimensions(shape: PieceShape, cellSize: number): { width: number; height: number } {
    return {
      width: shape[0].length * cellSize,
      height: shape.length * cellSize,
    };
  }

  static renderPieceCentered(
    ctx: CanvasRenderingContext2D,
    piece: Piece,
    centerX: number,
    centerY: number,
    cellSize: number,
    alpha: number = 1.0
  ): void {
    const dims = this.getPieceDimensions(piece.shape, cellSize);
    const x = centerX - dims.width / 2;
    const y = centerY - dims.height / 2;

    this.renderPiece(ctx, piece, x, y, cellSize, alpha);
  }
}
