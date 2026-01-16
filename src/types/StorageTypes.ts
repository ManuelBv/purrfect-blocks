// Storage-related types

import type { GameStateData, ScoreEntry } from './GameTypes';

export interface StorageAdapter {
  save(key: string, value: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface GameHistory {
  sessions: GameSession[];
  highScores: ScoreEntry[];
  totalGamesPlayed: number;
  totalLinesCleared: number;
}

export interface GameSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  finalScore: number;
  linesCleared: number;
  maxCascade: number;
  completed: boolean;
}
