// Draws the 12×18 grid and placed pieces

import type { Cell } from '../board/Cell';
import { calculateBoardDimensions } from '../utils/Constants';
import { UI_COLORS } from '../utils/Colors';

export class BoardRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2d context');
    }
    this.ctx = context;

    const dims = calculateBoardDimensions();
    this.cellSize = dims.cellSize;
    canvas.width = dims.width;
    canvas.height = dims.height;
  }

  render(cells: Cell[][]): void {
    this.clear();
    this.drawGrid();
    this.drawCells(cells);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = UI_COLORS.GRID_LINE;
    this.ctx.lineWidth = 1;

    const rows = 18;
    const cols = 12;

    // Draw horizontal lines
    for (let r = 0; r <= rows; r++) {
      const y = r * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(cols * this.cellSize, y);
      this.ctx.stroke();
    }

    // Draw vertical lines
    for (let c = 0; c <= cols; c++) {
      const x = c * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, rows * this.cellSize);
      this.ctx.stroke();
    }
  }

  private drawCells(cells: Cell[][]): void {
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        const cell = cells[r][c];
        if (cell.occupied && cell.color) {
          this.drawCell(r, c, cell.color);
        }
      }
    }
  }

  private drawCell(row: number, col: number, color: string): void {
    const x = col * this.cellSize;
    const y = row * this.cellSize;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
  }

  getCellSize(): number {
    return this.cellSize;
  }
}
