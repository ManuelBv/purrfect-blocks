// Piece-related types

export type PieceShape = boolean[][];

export enum PieceType {
  TETROMINO_L = 'TETROMINO_L',
  TETROMINO_I = 'TETROMINO_I',
  TETROMINO_F = 'TETROMINO_F',
  TETROMINO_T = 'TETROMINO_T',
  SQUARE = 'SQUARE',
}

export interface PieceDefinition {
  type: PieceType;
  shape: PieceShape;
  color: string;
  rotation: number; // 0, 90, 180, 270
  size: number; // For squares: 1, 2, 3, 4, 5, 6
}

export interface PieceData {
  id: string;
  definition: PieceDefinition;
}
