// Row/column completion detection

import type { Cell } from '../board/Cell';
import type { CompleteLines } from '../types/GameTypes';

export class LineDetector {
  static detectCompleteLines(cells: Cell[][]): CompleteLines {
    const rows: number[] = [];
    const cols: number[] = [];
    const numRows = cells.length;
    const numCols = cells[0].length;

    // Check rows
    for (let r = 0; r < numRows; r++) {
      if (this.isRowComplete(cells, r)) {
        rows.push(r);
      }
    }

    // Check columns
    for (let c = 0; c < numCols; c++) {
      if (this.isColumnComplete(cells, c)) {
        cols.push(c);
      }
    }

    return { rows, cols };
  }

  private static isRowComplete(cells: Cell[][], row: number): boolean {
    return cells[row].every(cell => cell.occupied);
  }

  private static isColumnComplete(cells: Cell[][], col: number): boolean {
    return cells.every(row => row[col].occupied);
  }
}
