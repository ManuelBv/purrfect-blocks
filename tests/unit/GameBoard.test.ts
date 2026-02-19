// Unit tests for GameBoard

import { describe, it, expect, beforeEach } from 'vitest';
import { GameBoard } from '../../src/game/GameBoard';
import type { PieceShape } from '../../src/types/PieceTypes';

const piece1x1: PieceShape = [[true]];
const piece2x2: PieceShape = [
  [true, true],
  [true, true],
];

describe('GameBoard', () => {
  let board: GameBoard;

  beforeEach(() => {
    board = new GameBoard();
  });

  describe('constructor', () => {
    it('should have rows === 8', () => {
      expect(board.rows).toBe(8);
    });

    it('should have cols === 8', () => {
      expect(board.cols).toBe(8);
    });
  });

  describe('getCells', () => {
    it('should return an 8x8 grid', () => {
      const cells = board.getCells();
      expect(cells).toHaveLength(8);
      expect(cells[0]).toHaveLength(8);
    });

    it('should return a grid of empty cells initially', () => {
      const cells = board.getCells();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          expect(cells[r][c].isEmpty()).toBe(true);
        }
      }
    });
  });

  describe('getCell', () => {
    it('should return a Cell for valid position (0,0)', () => {
      const cell = board.getCell(0, 0);
      expect(cell).not.toBeNull();
    });

    it('should return null for row -1', () => {
      expect(board.getCell(-1, 0)).toBeNull();
    });

    it('should return null for row 8 (out of bounds)', () => {
      expect(board.getCell(8, 0)).toBeNull();
    });

    it('should return null for col -1', () => {
      expect(board.getCell(0, -1)).toBeNull();
    });

    it('should return null for col 8 (out of bounds)', () => {
      expect(board.getCell(0, 8)).toBeNull();
    });
  });

  describe('canPlacePiece', () => {
    it('should return true for 1x1 piece at (0,0) on empty board', () => {
      expect(board.canPlacePiece(piece1x1, 0, 0)).toBe(true);
    });

    it('should return false when target cell is occupied', () => {
      board.placePiece(piece1x1, 0, 0, '#ff0000', 'p1');
      expect(board.canPlacePiece(piece1x1, 0, 0)).toBe(false);
    });
  });

  describe('placePiece', () => {
    it('should occupy cell (3,3) after placing 1x1 piece there', () => {
      board.placePiece(piece1x1, 3, 3, '#ff0000', 'p1');
      const cell = board.getCell(3, 3)!;
      expect(cell.occupied).toBe(true);
      expect(cell.color).toBe('#ff0000');
      expect(cell.pieceId).toBe('p1');
    });

    it('should occupy all four cells for 2x2 piece at (0,0)', () => {
      board.placePiece(piece2x2, 0, 0, '#00ff00', 'p2');
      expect(board.getCell(0, 0)!.occupied).toBe(true);
      expect(board.getCell(0, 1)!.occupied).toBe(true);
      expect(board.getCell(1, 0)!.occupied).toBe(true);
      expect(board.getCell(1, 1)!.occupied).toBe(true);
    });
  });

  describe('getCompleteLines', () => {
    it('should return no complete rows or cols on fresh board', () => {
      const lines = board.getCompleteLines();
      expect(lines.rows).toHaveLength(0);
      expect(lines.cols).toHaveLength(0);
    });

    it('should detect a complete row when row 7 is fully filled', () => {
      for (let c = 0; c < 8; c++) {
        board.placePiece(piece1x1, 7, c, '#ff0000', `p-${c}`);
      }
      const lines = board.getCompleteLines();
      expect(lines.rows).toContain(7);
    });

    it('should detect a complete col when col 0 is fully filled', () => {
      for (let r = 0; r < 8; r++) {
        board.placePiece(piece1x1, r, 0, '#0000ff', `p-${r}`);
      }
      const lines = board.getCompleteLines();
      expect(lines.cols).toContain(0);
    });

    it('should not detect partial row as complete', () => {
      // Fill only 7 of 8 cells in row 0
      for (let c = 0; c < 7; c++) {
        board.placePiece(piece1x1, 0, c, '#ff0000', `p-${c}`);
      }
      const lines = board.getCompleteLines();
      expect(lines.rows).not.toContain(0);
    });
  });

  describe('clearLines', () => {
    it('should clear all cells in row 7 after clearLines([7], [])', () => {
      for (let c = 0; c < 8; c++) {
        board.placePiece(piece1x1, 7, c, '#ff0000', `p-${c}`);
      }
      board.clearLines([7], []);
      for (let c = 0; c < 8; c++) {
        expect(board.getCell(7, c)!.isEmpty()).toBe(true);
      }
    });

    it('should clear all cells in col 0 after clearLines([], [0])', () => {
      for (let r = 0; r < 8; r++) {
        board.placePiece(piece1x1, r, 0, '#0000ff', `p-${r}`);
      }
      board.clearLines([], [0]);
      for (let r = 0; r < 8; r++) {
        expect(board.getCell(r, 0)!.isEmpty()).toBe(true);
      }
    });
  });

  describe('explode3x3', () => {
    it('should clear up to 9 cells in a 3x3 area centered at (4,4)', () => {
      // Fill a 3x3 area around (4,4)
      for (let r = 3; r <= 5; r++) {
        for (let c = 3; c <= 5; c++) {
          board.placePiece(piece1x1, r, c, '#888888', `p-${r}-${c}`);
        }
      }
      const count = board.explode3x3(4, 4);
      expect(count).toBe(9);
      // All 9 cells should now be empty
      for (let r = 3; r <= 5; r++) {
        for (let c = 3; c <= 5; c++) {
          expect(board.getCell(r, c)!.isEmpty()).toBe(true);
        }
      }
    });

    it('should clear only in-bounds cells when exploding at corner (0,0)', () => {
      // Fill the whole board so any in-bounds cell would have been occupied
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          board.placePiece(piece1x1, r, c, '#aaaaaa', `p-${r}-${c}`);
        }
      }
      // Explode at corner — only 4 in-bounds cells: (0,0),(0,1),(1,0),(1,1)
      const count = board.explode3x3(0, 0);
      expect(count).toBe(4);
    });

    it('should return 0 when exploding an empty area', () => {
      const count = board.explode3x3(4, 4);
      expect(count).toBe(0);
    });
  });

  describe('isFull', () => {
    it('should return false for empty board', () => {
      expect(board.isFull()).toBe(false);
    });

    it('should return false when only some cells are occupied', () => {
      board.placePiece(piece1x1, 0, 0, '#ff0000', 'p1');
      board.placePiece(piece1x1, 7, 7, '#ff0000', 'p2');
      expect(board.isFull()).toBe(false);
    });

    it('should return true when every cell is occupied', () => {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          board.placePiece(piece1x1, r, c, '#ff0000', `p-${r}-${c}`);
        }
      }
      expect(board.isFull()).toBe(true);
    });

    it('should return false again after clear()', () => {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          board.placePiece(piece1x1, r, c, '#ff0000', `p-${r}-${c}`);
        }
      }
      board.clear();
      expect(board.isFull()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should make all cells empty', () => {
      board.placePiece(piece2x2, 0, 0, '#ff0000', 'p1');
      board.clear();
      const cells = board.getCells();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          expect(cells[r][c].isEmpty()).toBe(true);
        }
      }
    });
  });

  describe('serialize and deserialize', () => {
    it('should round-trip preserving occupied state', () => {
      board.placePiece(piece1x1, 2, 3, '#ff0000', 'p1');
      board.placePiece(piece2x2, 5, 5, '#00ff00', 'p2');

      const data = board.serialize();
      const restored = GameBoard.deserialize(data);

      expect(restored.getCell(2, 3)!.occupied).toBe(true);
      expect(restored.getCell(2, 3)!.color).toBe('#ff0000');
      expect(restored.getCell(5, 5)!.occupied).toBe(true);
      expect(restored.getCell(0, 0)!.occupied).toBe(false);
    });

    it('should serialize to an 8x8 array of CellData', () => {
      const data = board.serialize();
      expect(data).toHaveLength(8);
      expect(data[0]).toHaveLength(8);
    });
  });

  describe('applyGravity', () => {
    it('should move an isolated occupied cell down to the bottom of its column', () => {
      // Place a cell at row 0, col 0; rows 1-7 are empty
      board.placePiece(piece1x1, 0, 0, '#ff0000', 'p1');
      board.applyGravity();
      // Cell should have fallen to row 7
      expect(board.getCell(7, 0)!.occupied).toBe(true);
      expect(board.getCell(0, 0)!.occupied).toBe(false);
    });

    it('should return true when something fell', () => {
      board.placePiece(piece1x1, 0, 0, '#ff0000', 'p1');
      const fell = board.applyGravity();
      expect(fell).toBe(true);
    });

    it('should return false when nothing needs to fall (bottom row occupied)', () => {
      board.placePiece(piece1x1, 7, 0, '#ff0000', 'p1');
      const fell = board.applyGravity();
      expect(fell).toBe(false);
    });
  });
});
