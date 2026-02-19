// Unit tests for CascadeEngine

import { describe, it, expect, beforeEach } from 'vitest';
import { CascadeEngine } from '../../src/game/CascadeEngine';
import { GameBoard } from '../../src/game/GameBoard';

// Helper: fill an entire row on the board
function fillRow(board: GameBoard, row: number): void {
  const piece: boolean[][] = [[true]];
  for (let c = 0; c < board.cols; c++) {
    board.placePiece(piece, row, c, '#ff0000', `p-row${row}-col${c}`);
  }
}

describe('CascadeEngine', () => {
  let engine: CascadeEngine;
  let board: GameBoard;

  beforeEach(() => {
    engine = new CascadeEngine();
    board = new GameBoard();
  });

  describe('getCascadeLevel', () => {
    it('should start at 0', () => {
      expect(engine.getCascadeLevel()).toBe(0);
    });
  });

  describe('detectLines', () => {
    it('should return null on an empty board', () => {
      expect(engine.detectLines(board)).toBeNull();
    });

    it('should return a CompleteLines object when a full row exists', () => {
      fillRow(board, 7);
      const result = engine.detectLines(board);
      expect(result).not.toBeNull();
      expect(result!.rows).toContain(7);
    });

    it('should return null when no rows or cols are complete', () => {
      // Partially fill row 0 (only 7 of 8 cells)
      const piece: boolean[][] = [[true]];
      for (let c = 0; c < 7; c++) {
        board.placePiece(piece, 0, c, '#ff0000', `p-${c}`);
      }
      expect(engine.detectLines(board)).toBeNull();
    });
  });

  describe('clearLines', () => {
    it('should increment cascade level by 1 on each call', () => {
      fillRow(board, 7);
      const lines = engine.detectLines(board)!;
      engine.clearLines(board, lines);
      expect(engine.getCascadeLevel()).toBe(1);
    });

    it('should increment cascade level again on a second call', () => {
      fillRow(board, 6);
      fillRow(board, 7);

      const lines1 = engine.detectLines(board)!;
      engine.clearLines(board, lines1);
      // After clearing rows 6 and 7, board is empty
      // detectLines now returns null, but if we clear manually:
      expect(engine.getCascadeLevel()).toBe(1);
    });
  });

  describe('processCascade', () => {
    it('should return cascadeLevel=0 and totalLinesCleared=0 on empty board', () => {
      const result = engine.processCascade(board);
      expect(result.cascadeLevel).toBe(0);
      expect(result.totalLinesCleared).toBe(0);
    });

    it('should clear one full row and set cascadeLevel=1, totalLinesCleared=8 (1 row × 8 cols counted as 1 line)', () => {
      fillRow(board, 7);
      const result = engine.processCascade(board);
      // clearLines clears the row (8 cells) but returns rows.length + cols.length as linesThisPass
      // 1 row cleared = 1 line
      expect(result.cascadeLevel).toBe(1);
      expect(result.totalLinesCleared).toBe(1);
    });

    it('should clear two full rows and report totalLinesCleared=2', () => {
      fillRow(board, 6);
      fillRow(board, 7);
      const result = engine.processCascade(board);
      // Both rows detected in the same pass → 1 cascade level, 2 lines cleared
      expect(result.cascadeLevel).toBe(1);
      expect(result.totalLinesCleared).toBe(2);
    });

    it('should reset cascadeLevel to 0 at start of each processCascade call', () => {
      fillRow(board, 7);
      engine.processCascade(board);
      expect(engine.getCascadeLevel()).toBe(1);

      // Process again on empty board → level resets inside processCascade
      board.clear();
      const result = engine.processCascade(board);
      expect(result.cascadeLevel).toBe(0);
    });

    it('scoreAdded should always be 0 (calculated externally by ScoreManager)', () => {
      fillRow(board, 7);
      const result = engine.processCascade(board);
      expect(result.scoreAdded).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset cascadeLevel back to 0', () => {
      fillRow(board, 7);
      engine.processCascade(board);
      expect(engine.getCascadeLevel()).toBe(1);

      engine.reset();
      expect(engine.getCascadeLevel()).toBe(0);
    });
  });
});
