// Unit tests for PieceManager

import { describe, it, expect, beforeEach } from 'vitest';
import { PieceManager } from '../../src/game/PieceManager';
import { GameBoard } from '../../src/game/GameBoard';
import { BombPiece } from '../../src/pieces/BombPiece';

// Helper: fill every cell on the board so no piece can be placed
function fillBoard(board: GameBoard): void {
  const piece: boolean[][] = [[true]];
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      board.placePiece(piece, r, c, '#000000', `p-${r}-${c}`);
    }
  }
}

describe('PieceManager', () => {
  let manager: PieceManager;

  beforeEach(() => {
    manager = new PieceManager();
  });

  describe('constructor', () => {
    it('should start with 3 available pieces', () => {
      expect(manager.getAvailablePieces()).toHaveLength(3);
    });
  });

  describe('getAvailablePieces', () => {
    it('should return an array of 3 pieces', () => {
      const pieces = manager.getAvailablePieces();
      expect(pieces).toHaveLength(3);
    });
  });

  describe('selectPiece', () => {
    it('should return a Piece when index 0 is selected', () => {
      const piece = manager.selectPiece(0);
      expect(piece).not.toBeNull();
    });

    it('should set selectedIndex to 0 after selecting index 0', () => {
      manager.selectPiece(0);
      expect(manager.getSelectedIndex()).toBe(0);
    });

    it('should return null for out-of-bounds index 5', () => {
      const piece = manager.selectPiece(5);
      expect(piece).toBeNull();
    });

    it('should not change selectedIndex when out-of-bounds selection fails', () => {
      manager.selectPiece(5);
      expect(manager.getSelectedIndex()).toBe(-1);
    });
  });

  describe('consumePiece', () => {
    it('should return the consumed piece', () => {
      const originalPiece = manager.getAvailablePieces()[0];
      const consumed = manager.consumePiece(0);
      expect(consumed).toBe(originalPiece);
    });

    it('should still have 3 available pieces after consuming (slot replaced)', () => {
      manager.consumePiece(0);
      expect(manager.getAvailablePieces()).toHaveLength(3);
    });

    it('should replace consumed slot with a new piece', () => {
      const originalPiece = manager.getAvailablePieces()[0];
      manager.consumePiece(0);
      const newPiece = manager.getAvailablePieces()[0];
      expect(newPiece).not.toBe(originalPiece);
    });

    it('should reset selectedIndex to -1 after consuming', () => {
      manager.selectPiece(0);
      manager.consumePiece(0);
      expect(manager.getSelectedIndex()).toBe(-1);
    });

    it('should return null for out-of-bounds index', () => {
      expect(manager.consumePiece(10)).toBeNull();
    });
  });

  describe('clearSelection', () => {
    it('should set selectedIndex to -1', () => {
      manager.selectPiece(1);
      manager.clearSelection();
      expect(manager.getSelectedIndex()).toBe(-1);
    });
  });

  describe('hasAvailablePieces', () => {
    it('should return true when pieces exist', () => {
      expect(manager.hasAvailablePieces()).toBe(true);
    });
  });

  describe('hasPlayablePieces', () => {
    it('should return true on an empty board', () => {
      const board = new GameBoard();
      expect(manager.hasPlayablePieces(board)).toBe(true);
    });

    it('should return false when all board cells are occupied', () => {
      const board = new GameBoard();
      fillBoard(board);
      expect(manager.hasPlayablePieces(board)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should provide 3 new pieces after reset', () => {
      manager.selectPiece(0);
      manager.reset();
      expect(manager.getAvailablePieces()).toHaveLength(3);
    });

    it('should reset selectedIndex to -1', () => {
      manager.selectPiece(2);
      manager.reset();
      expect(manager.getSelectedIndex()).toBe(-1);
    });
  });
});
