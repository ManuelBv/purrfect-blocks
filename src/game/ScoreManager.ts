// Score calculation with cross-turn streak bonuses

import { SCORING } from '../utils/Constants';

export class ScoreManager {
  private score: number = 0;
  // Counts consecutive turns where the player cleared at least one line/column.
  // Resets to 0 when a turn passes with no clear.
  private streakLevel: number = 0;
  // The multiplier applied in the most recent addScore call, kept for HUD display.
  private lastMultiplier: number = 1.0;
  private totalLinesCleared: number = 0;

  /**
   * Add score for cleared lines.
   * The current streak level is used as a bonus multiplier, then the streak increments.
   * Call resetStreak() when a turn passes with no line clears.
   */
  addScore(linesCleared: number): number {
    const baseScore = linesCleared * SCORING.BASE_SCORE_PER_LINE;
    const streakBonus = 1 + (this.streakLevel * SCORING.CASCADE_BONUS_MULTIPLIER);
    const points = Math.floor(baseScore * streakBonus);

    this.score += points;
    this.lastMultiplier = streakBonus;
    this.streakLevel++;
    this.totalLinesCleared += linesCleared;

    return points;
  }

  getScore(): number {
    return this.score;
  }

  /**
   * Returns the multiplier applied in the most recent addScore call (for HUD display).
   * Returns 1.0 when no lines have been cleared yet or after a streak reset.
   */
  getComboMultiplier(): number {
    return this.lastMultiplier;
  }

  getStreakLevel(): number {
    return this.streakLevel;
  }

  getTotalLinesCleared(): number {
    return this.totalLinesCleared;
  }

  reset(): void {
    this.score = 0;
    this.streakLevel = 0;
    this.lastMultiplier = 1.0;
    this.totalLinesCleared = 0;
  }

  resetStreak(): void {
    this.streakLevel = 0;
    this.lastMultiplier = 1.0;
  }

  /** @deprecated Use resetStreak() */
  resetCombo(): void {
    this.resetStreak();
  }

  /**
   * Add points for bomb explosion
   * @param blocksCleared Number of blocks cleared by explosion
   * @returns Points earned
   */
  addExplosionScore(blocksCleared: number): number {
    const points = blocksCleared * 50; // 50 points per block
    this.score += points;
    return points;
  }
}
