// 12×18 grid state management

import { GRID_CONFIG } from '../utils/constants';
import { Cell } from '../board/Cell';
import { GridManager } from '../board/GridManager';
import type { CellData, CompleteLines } from '../types/GameTypes';
import type { PieceShape } from '../types/PieceTypes';

export class GameBoard {
  private cells: Cell[][];
  readonly rows: number = GRID_CONFIG.ROWS;
  readonly cols: number = GRID_CONFIG.COLS;

  constructor() {
    this.cells = this.initializeGrid();
  }

  private initializeGrid(): Cell[][] {
    const grid: Cell[][] = [];
    for (let r = 0; r < this.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        grid[r][c] = new Cell();
      }
    }
    return grid;
  }

  getCells(): Cell[][] {
    return this.cells;
  }

  getCell(row: number, col: number): Cell | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.cells[row][col];
  }

  canPlacePiece(piece: PieceShape, row: number, col: number): boolean {
    return GridManager.canPlacePiece(this.cells, piece, row, col);
  }

  placePiece(piece: PieceShape, row: number, col: number, color: string, pieceId: string): void {
    const positions = GridManager.getOccupiedPositions(piece, row, col);

    for (const pos of positions) {
      this.cells[pos.row][pos.col].fill(color, pieceId);
    }
  }

  getCompleteLines(): CompleteLines {
    const rows: number[] = [];
    const cols: number[] = [];

    // Check rows
    for (let r = 0; r < this.rows; r++) {
      if (this.isRowComplete(r)) {
        rows.push(r);
      }
    }

    // Check columns
    for (let c = 0; c < this.cols; c++) {
      if (this.isColumnComplete(c)) {
        cols.push(c);
      }
    }

    return { rows, cols };
  }

  private isRowComplete(row: number): boolean {
    for (let c = 0; c < this.cols; c++) {
      if (this.cells[row][c].isEmpty()) {
        return false;
      }
    }
    return true;
  }

  private isColumnComplete(col: number): boolean {
    for (let r = 0; r < this.rows; r++) {
      if (this.cells[r][col].isEmpty()) {
        return false;
      }
    }
    return true;
  }

  clearLines(rows: number[], cols: number[]): number {
    let clearedCount = 0;

    // Clear rows
    for (const row of rows) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[row][c].occupied) {
          this.cells[row][c].clear();
          clearedCount++;
        }
      }
    }

    // Clear columns (avoid double-clearing intersections)
    for (const col of cols) {
      for (let r = 0; r < this.rows; r++) {
        if (this.cells[r][col].occupied) {
          this.cells[r][col].clear();
          clearedCount++;
        }
      }
    }

    return rows.length + cols.length;
  }

  applyGravity(): boolean {
    let fellSomething = false;

    // Process each column from bottom to top
    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1; // Where to write the next occupied cell

      // Scan from bottom to top
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.cells[r][c].occupied) {
          if (r !== writeRow) {
            // Move cell down
            const cellData = this.cells[r][c].toData();
            this.cells[writeRow][c].fill(cellData.color!, cellData.pieceId!);
            this.cells[r][c].clear();
            fellSomething = true;
          }
          writeRow--;
        }
      }
    }

    return fellSomething;
  }

  isFull(): boolean {
    // Check if there's no valid placement for any piece type
    // For now, simple check: if top row has any occupied cells
    for (let c = 0; c < this.cols; c++) {
      if (this.cells[0][c].occupied) {
        return true;
      }
    }
    return false;
  }

  serialize(): CellData[][] {
    return this.cells.map(row => row.map(cell => cell.toData()));
  }

  static deserialize(data: CellData[][]): GameBoard {
    const board = new GameBoard();
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        board.cells[r][c] = Cell.fromData(data[r][c]);
      }
    }
    return board;
  }

  clear(): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.cells[r][c].clear();
      }
    }
  }
}
