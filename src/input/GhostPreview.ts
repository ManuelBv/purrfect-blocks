// Ghost preview for piece placement

import type { PieceShape } from '../types/PieceTypes';
import type { Cell } from '../board/Cell';
import { GRID_CONFIG } from '../utils/Constants';

export class GhostPreview {
  /**
   * Convert a hex color to a lighter version
   */
  private static lightenColor(color: string, percent: number): string {
    // Parse hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Lighten by moving toward white
    const newR = Math.min(255, Math.floor(r + (255 - r) * percent));
    const newG = Math.min(255, Math.floor(g + (255 - g) * percent));
    const newB = Math.min(255, Math.floor(b + (255 - b) * percent));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Detect which rows and columns will be completed if piece is placed
   */
  private static detectCompletedLines(
    cells: Cell[][],
    shape: PieceShape,
    row: number,
    col: number
  ): { rows: number[]; cols: number[] } {
    const rows: number[] = [];
    const cols: number[] = [];

    // Create a temporary occupied map to simulate placement
    const occupiedMap: boolean[][] = [];
    for (let r = 0; r < GRID_CONFIG.ROWS; r++) {
      occupiedMap[r] = [];
      for (let c = 0; c < GRID_CONFIG.COLS; c++) {
        occupiedMap[r][c] = cells[r][c].occupied;
      }
    }

    // Place piece temporarily
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const targetRow = row + r;
          const targetCol = col + c;
          if (targetRow >= 0 && targetRow < GRID_CONFIG.ROWS &&
              targetCol >= 0 && targetCol < GRID_CONFIG.COLS) {
            occupiedMap[targetRow][targetCol] = true;
          }
        }
      }
    }

    // Check rows
    for (let r = 0; r < GRID_CONFIG.ROWS; r++) {
      if (occupiedMap[r].every(occupied => occupied)) {
        rows.push(r);
      }
    }

    // Check columns
    for (let c = 0; c < GRID_CONFIG.COLS; c++) {
      if (occupiedMap.every(row => row[c])) {
        cols.push(c);
      }
    }

    return { rows, cols };
  }

  static render(
    ctx: CanvasRenderingContext2D,
    shape: PieceShape,
    row: number,
    col: number,
    cellSize: number,
    isValid: boolean,
    pieceColor: string,
    cells?: Cell[][]
  ): void {
    // Only show shadow when placement is valid - ignore invalid placement entirely
    if (!isValid) return;

    // Fallback to a default color if pieceColor is undefined
    const safeColor = pieceColor || '#CCCCCC';

    // Use a lighter version of the piece color (50% lighter)
    const color = this.lightenColor(safeColor, 0.5);

    ctx.save();

    // Detect completed lines if cells are provided
    let completedLines: { rows: number[]; cols: number[] } | null = null;
    if (cells) {
      completedLines = this.detectCompletedLines(cells, shape, row, col);
    }

    // Draw highlight borders for rows/columns that will be cleared
    if (completedLines && (completedLines.rows.length > 0 || completedLines.cols.length > 0)) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.globalAlpha = 0.8;

      // Highlight completed rows
      for (const r of completedLines.rows) {
        ctx.strokeRect(
          0,
          r * cellSize,
          GRID_CONFIG.COLS * cellSize,
          cellSize
        );
      }

      // Highlight completed columns
      for (const c of completedLines.cols) {
        ctx.strokeRect(
          c * cellSize,
          0,
          cellSize,
          GRID_CONFIG.ROWS * cellSize
        );
      }
    }

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
