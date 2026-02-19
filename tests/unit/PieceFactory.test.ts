// Unit tests for PieceFactory

import { describe, it, expect, beforeEach } from 'vitest';
import { PieceFactory } from '../../src/pieces/PieceFactory';
import { BombPiece } from '../../src/pieces/BombPiece';
import { PIECE_DEFINITIONS } from '../../src/pieces/PieceDefinitions';

describe('PieceFactory', () => {
  let factory: PieceFactory;

  beforeEach(() => {
    factory = new PieceFactory();
  });

  describe('PIECE_DEFINITIONS', () => {
    it('should have exactly 19 piece definitions', () => {
      expect(PIECE_DEFINITIONS.length).toBe(19);
    });
  });

  describe('createRandomPiece', () => {
    it('should return a valid Piece with a shape', () => {
      const piece = factory.createRandomPiece();
      expect(piece.shape).toBeDefined();
      expect(piece.shape.length).toBeGreaterThan(0);
    });

    it('should return a piece with a color', () => {
      const piece = factory.createRandomPiece();
      expect(typeof piece.color).toBe('string');
      expect(piece.color.length).toBeGreaterThan(0);
    });

    it('should return a piece with valid width', () => {
      const piece = factory.createRandomPiece();
      expect(piece.width).toBeGreaterThan(0);
    });

    it('should return a piece with valid height', () => {
      const piece = factory.createRandomPiece();
      expect(piece.height).toBeGreaterThan(0);
    });
  });

  describe('createPieceByIndex', () => {
    it('should return the first piece definition at index 0', () => {
      const piece = factory.createPieceByIndex(0);
      expect(piece.shape).toEqual(PIECE_DEFINITIONS[0].shape);
      expect(piece.color).toBe(PIECE_DEFINITIONS[0].color);
    });

    it('should return the last piece definition at index 18', () => {
      const piece = factory.createPieceByIndex(18);
      expect(piece.shape).toEqual(PIECE_DEFINITIONS[18].shape);
      expect(piece.color).toBe(PIECE_DEFINITIONS[18].color);
    });

    it('should throw Error for index -1', () => {
      expect(() => factory.createPieceByIndex(-1)).toThrow(Error);
    });

    it('should throw Error for index 19 (out of bounds)', () => {
      expect(() => factory.createPieceByIndex(19)).toThrow(Error);
    });
  });

  describe('createBombPiece', () => {
    it('should return a BombPiece with isBomb === true', () => {
      const bomb = factory.createBombPiece();
      expect(bomb.isBomb).toBe(true);
      expect(bomb).toBeInstanceOf(BombPiece);
    });
  });

  describe('createMultiplePieces', () => {
    it('should return 3 pieces when count is 3', () => {
      const pieces = factory.createMultiplePieces(3);
      expect(pieces).toHaveLength(3);
    });

    it('should return 0 pieces when count is 0', () => {
      const pieces = factory.createMultiplePieces(0);
      expect(pieces).toHaveLength(0);
    });

    it('should never inject bombs (bomb scheduling is PieceManager\'s responsibility)', () => {
      for (let i = 0; i < 30; i++) {
        const pieces = factory.createMultiplePieces(3);
        const bombs = pieces.filter(p => p instanceof BombPiece);
        expect(bombs).toHaveLength(0);
      }
    });

    it('should return pieces with valid shapes', () => {
      const pieces = factory.createMultiplePieces(3);
      for (const piece of pieces) {
        expect(piece.shape.length).toBeGreaterThan(0);
        expect(piece.shape[0].length).toBeGreaterThan(0);
      }
    });
  });
});
