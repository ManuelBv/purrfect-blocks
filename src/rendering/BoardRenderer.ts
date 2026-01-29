// Draws the 12×18 grid and placed pieces

import type { Cell } from '../board/Cell';
import { calculateBoardDimensions } from '../utils/Constants';
import { UI_COLORS } from '../utils/Colors';
import { clearBoardCanvas } from '../utils/CanvasUtils';

export class BoardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
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
    clearBoardCanvas(this.ctx);
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(141, 110, 99, 0.3)';
    this.ctx.lineWidth = 0.5;

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

  /**
   * Draw a cell with break animation progress (0 = full, 1 = gone)
   */
  drawCellWithAnimation(row: number, col: number, color: string, progress: number): void {
    const x = col * this.cellSize;
    const y = row * this.cellSize;
    const size = this.cellSize - 2;

    this.ctx.save();

    // More dramatic break animation
    const offset = progress * (this.cellSize * 0.6); // Spread further (was 0.3)
    const fadeAlpha = Math.max(0, 1 - progress * 1.2); // Fade out faster
    const scale = Math.max(0, 1 - progress * 0.8); // Shrink more (was 0.5)

    // Add rotation for more dynamic effect
    const rotation = progress * Math.PI * 0.5; // Rotate as they break

    this.ctx.globalAlpha = fadeAlpha;

    const quadSize = size / 2;
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;

    // Draw each quadrant with rotation
    const quadrants = [
      { offsetX: -1, offsetY: -1 }, // Top-left
      { offsetX: 1, offsetY: -1 },  // Top-right
      { offsetX: -1, offsetY: 1 },  // Bottom-left
      { offsetX: 1, offsetY: 1 },   // Bottom-right
    ];

    quadrants.forEach(({ offsetX, offsetY }) => {
      this.ctx.save();

      // Position of this quadrant
      const qx = centerX + offsetX * offset;
      const qy = centerY + offsetY * offset;

      // Translate to quadrant position
      this.ctx.translate(qx, qy);

      // Rotate around quadrant center
      this.ctx.rotate(rotation * offsetX * offsetY);

      // Draw the quadrant centered
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        -quadSize * scale / 2,
        -quadSize * scale / 2,
        quadSize * scale,
        quadSize * scale
      );

      this.ctx.restore();
    });

    this.ctx.restore();
  }

  getCellSize(): number {
    return this.cellSize;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
