// Rendering-related types

import type { CellData, GameState } from './GameTypes';
import type { PieceData } from './PieceTypes';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasElements {
  background: HTMLCanvasElement;
  board: HTMLCanvasElement;
  interactive: HTMLCanvasElement;
  ui: HTMLCanvasElement;
}

export interface GameRenderState {
  board: CellData[][];
  pieces: PieceData[];
  piecePanel: PieceData[];
  score: number;
  combo: number;
  gameState: GameState;
  effects: VisualEffect[];
  cats: CatState[];
}

export interface VisualEffect {
  type: 'CLEAR_LINE' | 'GLOW' | 'FALL';
  position: { row: number; col: number };
  progress: number; // 0-1
  color: string;
}

export interface CatState {
  x: number;
  y: number;
  state: 'IDLE' | 'SWAT' | 'PURR' | 'EXCITED';
  animationFrame: number;
}
