// Unit tests for Cell

import { describe, it, expect } from 'vitest';
import { Cell } from '../../src/board/Cell';

describe('Cell', () => {
  describe('initial state', () => {
    it('should start unoccupied', () => {
      const cell = new Cell();
      expect(cell.occupied).toBe(false);
    });

    it('should start with null color', () => {
      const cell = new Cell();
      expect(cell.color).toBeNull();
    });

    it('should start with null pieceId', () => {
      const cell = new Cell();
      expect(cell.pieceId).toBeNull();
    });
  });

  describe('fill', () => {
    it('should mark cell as occupied after fill', () => {
      const cell = new Cell();
      cell.fill('red', 'p1');
      expect(cell.occupied).toBe(true);
    });

    it('should set color after fill', () => {
      const cell = new Cell();
      cell.fill('red', 'p1');
      expect(cell.color).toBe('red');
    });

    it('should set pieceId after fill', () => {
      const cell = new Cell();
      cell.fill('red', 'p1');
      expect(cell.pieceId).toBe('p1');
    });
  });

  describe('isEmpty', () => {
    it('should return true when unoccupied', () => {
      const cell = new Cell();
      expect(cell.isEmpty()).toBe(true);
    });

    it('should return false after fill', () => {
      const cell = new Cell();
      cell.fill('blue', 'p2');
      expect(cell.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should set occupied to false after clear', () => {
      const cell = new Cell();
      cell.fill('red', 'p1');
      cell.clear();
      expect(cell.occupied).toBe(false);
    });

    it('should set color to null after clear', () => {
      const cell = new Cell();
      cell.fill('red', 'p1');
      cell.clear();
      expect(cell.color).toBeNull();
    });

    it('should set pieceId to null after clear', () => {
      const cell = new Cell();
      cell.fill('red', 'p1');
      cell.clear();
      expect(cell.pieceId).toBeNull();
    });
  });

  describe('toData', () => {
    it('should return correct CellData shape for empty cell', () => {
      const cell = new Cell();
      const data = cell.toData();
      expect(data).toEqual({ occupied: false, color: null, pieceId: null });
    });

    it('should return correct CellData shape for filled cell', () => {
      const cell = new Cell();
      cell.fill('#ff0000', 'piece-abc');
      const data = cell.toData();
      expect(data).toEqual({ occupied: true, color: '#ff0000', pieceId: 'piece-abc' });
    });
  });

  describe('Cell.fromData', () => {
    it('should reconstruct a filled cell correctly', () => {
      const data = { occupied: true, color: '#00ff00', pieceId: 'piece-xyz' };
      const cell = Cell.fromData(data);
      expect(cell.occupied).toBe(true);
      expect(cell.color).toBe('#00ff00');
      expect(cell.pieceId).toBe('piece-xyz');
    });

    it('should reconstruct an empty cell correctly', () => {
      const data = { occupied: false, color: null, pieceId: null };
      const cell = Cell.fromData(data);
      expect(cell.occupied).toBe(false);
      expect(cell.color).toBeNull();
      expect(cell.pieceId).toBeNull();
    });
  });
});
