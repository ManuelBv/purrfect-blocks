// Unit tests for BombPiece

import { describe, it, expect } from 'vitest';
import { BombPiece } from '../../src/pieces/BombPiece';

describe('BombPiece', () => {
  describe('constructor', () => {
    it('should have isBomb === true', () => {
      const bomb = new BombPiece();
      expect(bomb.isBomb).toBe(true);
    });

    it('should have shape [[true]] (1x1)', () => {
      const bomb = new BombPiece();
      expect(bomb.shape).toEqual([[true]]);
    });

    it('should have width === 1', () => {
      const bomb = new BombPiece();
      expect(bomb.width).toBe(1);
    });

    it('should have height === 1', () => {
      const bomb = new BombPiece();
      expect(bomb.height).toBe(1);
    });
  });

  describe('getExplosionCells', () => {
    it('should return exactly 9 cells for center position (5, 5)', () => {
      const bomb = new BombPiece();
      const cells = bomb.getExplosionCells(5, 5);
      expect(cells).toHaveLength(9);
    });

    it('should return cells covering rows 4-6 and cols 4-6 for center (5,5)', () => {
      const bomb = new BombPiece();
      const cells = bomb.getExplosionCells(5, 5);

      for (let r = 4; r <= 6; r++) {
        for (let c = 4; c <= 6; c++) {
          expect(cells).toContainEqual({ row: r, col: c });
        }
      }
    });

    it('should return cells including negative coordinates for center (0,0)', () => {
      const bomb = new BombPiece();
      const cells = bomb.getExplosionCells(0, 0);
      // No bounds check, so negative coords are included
      expect(cells).toContainEqual({ row: -1, col: -1 });
      expect(cells).toContainEqual({ row: -1, col: 0 });
      expect(cells).toContainEqual({ row: 0, col: -1 });
    });

    it('should return exactly 9 cells even for corner position (0,0)', () => {
      const bomb = new BombPiece();
      const cells = bomb.getExplosionCells(0, 0);
      expect(cells).toHaveLength(9);
    });

    it('should not return duplicate cells in explosion result', () => {
      const bomb = new BombPiece();
      const cells = bomb.getExplosionCells(5, 5);

      const unique = new Set(cells.map(c => `${c.row},${c.col}`));
      expect(unique.size).toBe(cells.length);
    });
  });
});
