// Unit tests for GridManager

import { describe, it, expect } from 'vitest';
import { GridManager } from '../../src/board/GridManager';
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

const piece1x1: PieceShape = [[true]];
const piece2x2: PieceShape = [
  [true, true],
  [true, true],
];
const pieceL: PieceShape = [
  [true, false],
  [true, false],
  [true, true],
];

describe('GridManager', () => {
  describe('isValidPosition', () => {
    it('should return true for (0,0) on 8x8 grid', () => {
      expect(GridManager.isValidPosition(0, 0, 8, 8)).toBe(true);
    });

    it('should return true for (7,7) (last valid index) on 8x8 grid', () => {
      expect(GridManager.isValidPosition(7, 7, 8, 8)).toBe(true);
    });

    it('should return false for (-1,0)', () => {
      expect(GridManager.isValidPosition(-1, 0, 8, 8)).toBe(false);
    });

    it('should return false for (0,-1)', () => {
      expect(GridManager.isValidPosition(0, -1, 8, 8)).toBe(false);
    });

    it('should return false for (8,0) (equal to rows)', () => {
      expect(GridManager.isValidPosition(8, 0, 8, 8)).toBe(false);
    });

    it('should return false for (0,8) (equal to cols)', () => {
      expect(GridManager.isValidPosition(0, 8, 8, 8)).toBe(false);
    });
  });

  describe('canPlacePiece', () => {
    it('should return true for 1x1 piece on empty grid at (0,0)', () => {
      const grid = makeGrid(8, 8);
      expect(GridManager.canPlacePiece(grid, piece1x1, 0, 0)).toBe(true);
    });

    it('should return false for 1x1 piece out of bounds (row=-1)', () => {
      const grid = makeGrid(8, 8);
      expect(GridManager.canPlacePiece(grid, piece1x1, -1, 0)).toBe(false);
    });

    it('should return false for 1x1 piece on an occupied cell', () => {
      const grid = makeGrid(8, 8);
      grid[0][0].fill('red', 'p1');
      expect(GridManager.canPlacePiece(grid, piece1x1, 0, 0)).toBe(false);
    });

    it('should return false for 2x2 piece at (7,7) on 8x8 grid (would go out of bounds)', () => {
      const grid = makeGrid(8, 8);
      expect(GridManager.canPlacePiece(grid, piece2x2, 7, 7)).toBe(false);
    });

    it('should return true for 2x2 piece at (6,6) on 8x8 grid when all empty', () => {
      const grid = makeGrid(8, 8);
      expect(GridManager.canPlacePiece(grid, piece2x2, 6, 6)).toBe(true);
    });
  });

  describe('getOccupiedPositions', () => {
    it('should return 4 positions for 2x2 piece at (2,3)', () => {
      const positions = GridManager.getOccupiedPositions(piece2x2, 2, 3);
      expect(positions).toHaveLength(4);
      expect(positions).toContainEqual({ row: 2, col: 3 });
      expect(positions).toContainEqual({ row: 2, col: 4 });
      expect(positions).toContainEqual({ row: 3, col: 3 });
      expect(positions).toContainEqual({ row: 3, col: 4 });
    });

    it('should return only the true cells for an L-shaped piece at (0,0)', () => {
      // pieceL has 3 rows × 2 cols with 4 true cells
      const positions = GridManager.getOccupiedPositions(pieceL, 0, 0);
      // L shape: (0,0), (1,0), (2,0), (2,1)
      expect(positions).toHaveLength(4);
      expect(positions).toContainEqual({ row: 0, col: 0 });
      expect(positions).toContainEqual({ row: 1, col: 0 });
      expect(positions).toContainEqual({ row: 2, col: 0 });
      expect(positions).toContainEqual({ row: 2, col: 1 });
    });

    it('should return 1 position for 1x1 piece at (5,5)', () => {
      const positions = GridManager.getOccupiedPositions(piece1x1, 5, 5);
      expect(positions).toHaveLength(1);
      expect(positions).toContainEqual({ row: 5, col: 5 });
    });
  });
});
