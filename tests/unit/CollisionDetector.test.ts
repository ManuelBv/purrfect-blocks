// Unit tests for CollisionDetector

import { describe, it, expect } from 'vitest';
import { CollisionDetector } from '../../src/board/CollisionDetector';
import { Cell } from '../../src/board/Cell';
import type { PieceShape } from '../../src/types/PieceTypes';

// Helper: create a grid of empty cells
function makeGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = new Cell();
    }
  }
  return grid;
}

// Helper: fill every cell in the grid
function fillGrid(grid: Cell[][]): void {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      grid[r][c].fill('#000000', `p-${r}-${c}`);
    }
  }
}

const piece1x1: PieceShape = [[true]];
const piece2x2: PieceShape = [
  [true, true],
  [true, true],
];

describe('CollisionDetector', () => {
  describe('canPlace', () => {
    it('should return true for valid placement on empty cell', () => {
      const grid = makeGrid(8, 8);
      expect(CollisionDetector.canPlace(grid, piece1x1, 0, 0)).toBe(true);
    });

    it('should return false when placement is out of bounds', () => {
      const grid = makeGrid(8, 8);
      expect(CollisionDetector.canPlace(grid, piece1x1, -1, 0)).toBe(false);
    });

    it('should return false when placement is out of bounds on the right', () => {
      const grid = makeGrid(8, 8);
      expect(CollisionDetector.canPlace(grid, piece1x1, 0, 8)).toBe(false);
    });

    it('should return false when cell is occupied', () => {
      const grid = makeGrid(8, 8);
      grid[3][3].fill('red', 'p1');
      expect(CollisionDetector.canPlace(grid, piece1x1, 3, 3)).toBe(false);
    });

    it('should return false for 2x2 piece extending out of bounds', () => {
      const grid = makeGrid(8, 8);
      expect(CollisionDetector.canPlace(grid, piece2x2, 7, 7)).toBe(false);
    });
  });

  describe('hasValidPlacement', () => {
    it('should return true when at least one position fits on empty board', () => {
      const grid = makeGrid(8, 8);
      expect(CollisionDetector.hasValidPlacement(grid, piece1x1)).toBe(true);
    });

    it('should return false when board is completely full', () => {
      const grid = makeGrid(8, 8);
      fillGrid(grid);
      expect(CollisionDetector.hasValidPlacement(grid, piece1x1)).toBe(false);
    });

    it('should return false for 2x2 piece on a 1x1 board', () => {
      const grid = makeGrid(1, 1);
      expect(CollisionDetector.hasValidPlacement(grid, piece2x2)).toBe(false);
    });

    it('should return true when a 1x1 piece fits on partially filled board', () => {
      const grid = makeGrid(8, 8);
      // Fill all except (7,7)
      fillGrid(grid);
      grid[7][7].clear();
      expect(CollisionDetector.hasValidPlacement(grid, piece1x1)).toBe(true);
    });
  });
});
