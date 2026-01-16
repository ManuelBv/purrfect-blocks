// Handles falling blocks and chain reactions

import type { GameBoard } from './GameBoard';
import type { CascadeResult, CompleteLines } from '../types/GameTypes';
import { LineDetector } from './LineDetector';

export class CascadeEngine {
  private cascadeLevel: number = 0;

  /**
   * Detect lines that need to be cleared (does not clear them)
   * Returns null if no lines to clear
   */
  detectLines(board: GameBoard): CompleteLines | null {
    const completeLines = board.getCompleteLines();
    const linesCount = completeLines.rows.length + completeLines.cols.length;

    if (linesCount === 0) {
      return null;
    }

    return completeLines;
  }

  /**
   * Actually clear the detected lines from the board
   */
  clearLines(board: GameBoard, lines: CompleteLines): number {
    const linesCleared = lines.rows.length + lines.cols.length;
    board.clearLines(lines.rows, lines.cols);
    this.cascadeLevel++;
    return linesCleared;
  }

  /**
   * Original method kept for compatibility, but now instant (no animation)
   */
  processCascade(board: GameBoard): CascadeResult {
    let totalLinesCleared = 0;
    this.cascadeLevel = 0;

    // Keep processing until no more lines to clear
    while (true) {
      // 1. Detect complete lines
      const completeLines = board.getCompleteLines();
      const linesThisPass = completeLines.rows.length + completeLines.cols.length;

      if (linesThisPass === 0) {
        // No more lines to clear
        break;
      }

      // 2. Clear the lines
      board.clearLines(completeLines.rows, completeLines.cols);
      totalLinesCleared += linesThisPass;

      // 3. Increment cascade level (no gravity - blocks stay in place)
      this.cascadeLevel++;
    }

    return {
      cascadeLevel: this.cascadeLevel,
      totalLinesCleared,
      scoreAdded: 0, // Will be calculated by ScoreManager
    };
  }

  getCascadeLevel(): number {
    return this.cascadeLevel;
  }

  reset(): void {
    this.cascadeLevel = 0;
  }
}
