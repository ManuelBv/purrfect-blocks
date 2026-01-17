// Renders individual pieces

import type { Piece } from '../pieces/Piece';
import type { PieceShape } from '../types/PieceTypes';
import { PieceType } from '../types/PieceTypes';

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

    // Check if this is a bomb piece
    const isBomb = piece.definition.type === PieceType.BOMB;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const px = x + c * cellSize;
          const py = y + r * cellSize;

          if (isBomb) {
            // Draw yarn ball icon for bomb pieces
            this.drawYarnBall(ctx, px + cellSize / 2, py + cellSize / 2, cellSize * 0.4);
          } else {
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
    }

    ctx.restore();
  }

  /**
   * Draw a yarn ball icon for bomb pieces
   */
  private static drawYarnBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    ctx.save();

    // Draw yarn ball circle
    ctx.fillStyle = '#D2691E'; // Chocolate brown
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw yarn strands (crisscross pattern)
    ctx.strokeStyle = '#A0522D'; // Sienna brown (darker)
    ctx.lineWidth = radius * 0.15;

    // Diagonal line 1
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.6, cy - radius * 0.6);
    ctx.lineTo(cx + radius * 0.6, cy + radius * 0.6);
    ctx.stroke();

    // Diagonal line 2
    ctx.beginPath();
    ctx.moveTo(cx + radius * 0.6, cy - radius * 0.6);
    ctx.lineTo(cx - radius * 0.6, cy + radius * 0.6);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.7, cy);
    ctx.lineTo(cx + radius * 0.7, cy);
    ctx.stroke();

    // Add highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

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
