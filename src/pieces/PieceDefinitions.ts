// All 22 piece shape definitions

import type { PieceDefinition, PieceType, PieceShape } from '../types/PieceTypes';
import { PIECE_COLORS } from '../utils/Colors';

// Tetromino shapes with rotations
const L_SHAPES: Record<number, PieceShape> = {
  0: [
    [true, false],
    [true, false],
    [true, true],
  ],
  90: [
    [true, true, true],
    [true, false, false],
  ],
  180: [
    [true, true],
    [false, true],
    [false, true],
  ],
  270: [
    [false, false, true],
    [true, true, true],
  ],
};

const I_SHAPES: Record<number, PieceShape> = {
  0: [[true], [true], [true], [true]],
  90: [[true, true, true, true]],
  180: [[true], [true], [true], [true]],
  270: [[true, true, true, true]],
};

const F_SHAPES: Record<number, PieceShape> = {
  0: [
    [false, true, true],
    [true, true, false],
  ],
  90: [
    [true, false],
    [true, true],
    [false, true],
  ],
  180: [
    [false, true, true],
    [true, true, false],
  ],
  270: [
    [true, false],
    [true, true],
    [false, true],
  ],
};

const T_SHAPES: Record<number, PieceShape> = {
  0: [
    [true, true, true],
    [false, true, false],
  ],
  90: [
    [false, true],
    [true, true],
    [false, true],
  ],
  180: [
    [false, true, false],
    [true, true, true],
  ],
  270: [
    [true, false],
    [true, true],
    [true, false],
  ],
};

// Square shapes (1x1 through 6x6)
function createSquare(size: number): PieceShape {
  return Array(size).fill(null).map(() => Array(size).fill(true));
}

// Generate all piece definitions
export const PIECE_DEFINITIONS: PieceDefinition[] = [];

// Tetrominoes with rotations
const rotations = [0, 90, 180, 270];

rotations.forEach((rotation, idx) => {
  PIECE_DEFINITIONS.push({
    type: 'TETROMINO_L' as PieceType,
    shape: L_SHAPES[rotation],
    color: PIECE_COLORS[0],
    rotation,
    size: 0,
  });
});

rotations.forEach((rotation, idx) => {
  PIECE_DEFINITIONS.push({
    type: 'TETROMINO_I' as PieceType,
    shape: I_SHAPES[rotation],
    color: PIECE_COLORS[1],
    rotation,
    size: 0,
  });
});

rotations.forEach((rotation, idx) => {
  PIECE_DEFINITIONS.push({
    type: 'TETROMINO_F' as PieceType,
    shape: F_SHAPES[rotation],
    color: PIECE_COLORS[2],
    rotation,
    size: 0,
  });
});

rotations.forEach((rotation, idx) => {
  PIECE_DEFINITIONS.push({
    type: 'TETROMINO_T' as PieceType,
    shape: T_SHAPES[rotation],
    color: PIECE_COLORS[3],
    rotation,
    size: 0,
  });
});

// Square pieces (1x1 through 4x4) - limited to 4x4 for mobile compatibility
for (let size = 1; size <= 4; size++) {
  PIECE_DEFINITIONS.push({
    type: 'SQUARE' as PieceType,
    shape: createSquare(size),
    color: PIECE_COLORS[4],
    rotation: 0,
    size,
  });
}

// Total: 16 tetromino rotations + 4 squares = 20 pieces
console.assert(PIECE_DEFINITIONS.length === 20, 'Should have exactly 20 piece definitions');
