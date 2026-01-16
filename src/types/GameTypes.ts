// Core game types and interfaces

export enum GameState {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface Position {
  row: number;
  col: number;
}

export interface CellData {
  occupied: boolean;
  color: string | null;
  pieceId: string | null;
}

export interface CompleteLines {
  rows: number[];
  cols: number[];
}

export interface CascadeResult {
  cascadeLevel: number;
  totalLinesCleared: number;
  scoreAdded: number;
}

export interface GameStateData {
  board: CellData[][];
  score: number;
  cascadeLevel: number;
  availablePieces: string[]; // Piece IDs
  gameState: GameState;
  timestamp: number;
}

export interface GameEvent {
  type: 'LINE_CLEAR' | 'CASCADE' | 'PIECE_FALL' | 'PIECE_PLACED' | 'GAME_OVER';
  data?: any;
}

export interface ScoreEntry {
  score: number;
  date: Date;
  linesCleared: number;
  maxCascade: number;
}
