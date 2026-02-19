// Unit tests for Piece

import { describe, it, expect } from 'vitest';
import { Piece } from '../../src/pieces/Piece';
import { PieceType } from '../../src/types/PieceTypes';
import type { PieceDefinition } from '../../src/types/PieceTypes';

const sampleDefinition: PieceDefinition = {
  type: PieceType.TETROMINO_L,
  shape: [
    [true, false],
    [true, false],
    [true, true],
  ],
  color: '#ff6b35',
  rotation: 0,
  size: 0,
};

const singleCellDefinition: PieceDefinition = {
  type: PieceType.SQUARE,
  shape: [[true]],
  color: '#aabbcc',
  rotation: 0,
  size: 1,
};

describe('Piece', () => {
  describe('constructor', () => {
    it('should generate unique IDs for two pieces with the same definition', () => {
      const p1 = new Piece(sampleDefinition);
      const p2 = new Piece(sampleDefinition);
      expect(p1.id).not.toBe(p2.id);
    });

    it('should use provided id when given', () => {
      const p = new Piece(sampleDefinition, 'custom-id-123');
      expect(p.id).toBe('custom-id-123');
    });
  });

  describe('shape', () => {
    it('should return the shape from the definition', () => {
      const p = new Piece(sampleDefinition);
      expect(p.shape).toEqual(sampleDefinition.shape);
    });
  });

  describe('color', () => {
    it('should return the color from the definition', () => {
      const p = new Piece(sampleDefinition);
      expect(p.color).toBe('#ff6b35');
    });
  });

  describe('width', () => {
    it('should return the number of columns in the shape', () => {
      const p = new Piece(sampleDefinition);
      // shape[0] = [true, false] => 2 cols
      expect(p.width).toBe(2);
    });

    it('should return 1 for a 1x1 piece', () => {
      const p = new Piece(singleCellDefinition);
      expect(p.width).toBe(1);
    });
  });

  describe('height', () => {
    it('should return the number of rows in the shape', () => {
      const p = new Piece(sampleDefinition);
      // shape has 3 rows
      expect(p.height).toBe(3);
    });

    it('should return 1 for a 1x1 piece', () => {
      const p = new Piece(singleCellDefinition);
      expect(p.height).toBe(1);
    });
  });

  describe('toData', () => {
    it('should return an object with id and definition', () => {
      const p = new Piece(sampleDefinition);
      const data = p.toData();
      expect(data.id).toBe(p.id);
      expect(data.definition).toBe(sampleDefinition);
    });
  });

  describe('Piece.fromData', () => {
    it('should round-trip correctly preserving id', () => {
      const original = new Piece(sampleDefinition, 'round-trip-id');
      const restored = Piece.fromData(original.toData());
      expect(restored.id).toBe('round-trip-id');
    });

    it('should round-trip correctly preserving shape', () => {
      const original = new Piece(sampleDefinition, 'round-trip-id');
      const restored = Piece.fromData(original.toData());
      expect(restored.shape).toEqual(sampleDefinition.shape);
    });

    it('should round-trip correctly preserving color', () => {
      const original = new Piece(sampleDefinition, 'round-trip-id');
      const restored = Piece.fromData(original.toData());
      expect(restored.color).toBe(sampleDefinition.color);
    });
  });
});
