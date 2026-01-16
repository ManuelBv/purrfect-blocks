// Score calculation with cascade bonuses

import { SCORING } from '../utils/Constants';

export class ScoreManager {
  private score: number = 0;
  private comboMultiplier: number = 1.0;
  private totalLinesCleared: number = 0;

  addScore(linesCleared: number, cascadeLevel: number): number {
    const baseScore = linesCleared * SCORING.BASE_SCORE_PER_LINE;
    const cascadeBonus = 1 + (cascadeLevel * SCORING.CASCADE_BONUS_MULTIPLIER);
    const points = Math.floor(baseScore * cascadeBonus);

    this.score += points;
    this.comboMultiplier = cascadeBonus;
    this.totalLinesCleared += linesCleared;

    return points;
  }

  getScore(): number {
    return this.score;
  }

  getComboMultiplier(): number {
    return this.comboMultiplier;
  }

  getTotalLinesCleared(): number {
    return this.totalLinesCleared;
  }

  reset(): void {
    this.score = 0;
    this.comboMultiplier = 1.0;
    this.totalLinesCleared = 0;
  }

  resetCombo(): void {
    this.comboMultiplier = 1.0;
  }
}
