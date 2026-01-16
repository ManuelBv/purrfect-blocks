// Ghost preview for piece placement

import type { PieceShape } from '../types/PieceTypes';
import { UI_COLORS } from '../utils/Colors';

export class GhostPreview {
  static render(
    ctx: CanvasRenderingContext2D,
    shape: PieceShape,
    row: number,
    col: number,
    cellSize: number,
    isValid: boolean
  ): void {
    const color = isValid ? UI_COLORS.VALID_PLACEMENT : UI_COLORS.INVALID_PLACEMENT;

    ctx.save();

    // Draw ghost with glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.globalAlpha = 0.5;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const x = (col + c) * cellSize;
          const y = (row + r) * cellSize;

          // Draw glow border
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

          // Draw semi-transparent fill
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.3;
          ctx.fillRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
          ctx.globalAlpha = 0.5;
        }
      }
    }

    ctx.restore();
  }
}
