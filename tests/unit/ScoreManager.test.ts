// Unit tests for ScoreManager

import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreManager } from '../../src/game/ScoreManager';

describe('ScoreManager', () => {
  let manager: ScoreManager;

  beforeEach(() => {
    manager = new ScoreManager();
  });

  describe('initial state', () => {
    it('should start with score of 0', () => {
      expect(manager.getScore()).toBe(0);
    });

    it('should start with comboMultiplier of 1.0', () => {
      expect(manager.getComboMultiplier()).toBe(1.0);
    });

    it('should start with streakLevel of 0', () => {
      expect(manager.getStreakLevel()).toBe(0);
    });

    it('should start with totalLinesCleared of 0', () => {
      expect(manager.getTotalLinesCleared()).toBe(0);
    });
  });

  describe('addScore — first clear (streakLevel 0)', () => {
    it('should add 100 points for 1 line on first clear', () => {
      const pts = manager.addScore(1);
      expect(pts).toBe(100);
      expect(manager.getScore()).toBe(100);
    });

    it('should add 200 points for 2 lines on first clear', () => {
      const pts = manager.addScore(2);
      expect(pts).toBe(200);
      expect(manager.getScore()).toBe(200);
    });

    it('should track totalLinesCleared', () => {
      manager.addScore(3);
      expect(manager.getTotalLinesCleared()).toBe(3);
    });

    it('should increment streakLevel after first clear', () => {
      manager.addScore(1);
      expect(manager.getStreakLevel()).toBe(1);
    });

    it('should set comboMultiplier to 1.0 on first clear', () => {
      manager.addScore(1);
      expect(manager.getComboMultiplier()).toBe(1.0);
    });
  });

  describe('addScore — streak accumulation', () => {
    it('should apply 1.5x bonus on second consecutive clear', () => {
      manager.addScore(1); // streak 0 → 100 pts, streak becomes 1
      const pts = manager.addScore(1); // streak 1 → 150 pts
      expect(pts).toBe(150);
    });

    it('should apply 2.0x bonus on third consecutive clear', () => {
      manager.addScore(1); // streak 0 → 100 pts
      manager.addScore(1); // streak 1 → 150 pts
      const pts = manager.addScore(1); // streak 2 → 200 pts
      expect(pts).toBe(200);
    });

    it('should apply 1.5x to multiple lines on second clear', () => {
      manager.addScore(1); // streak 0 → 100 pts
      const pts = manager.addScore(3); // streak 1 → 3 * 100 * 1.5 = 450 pts
      expect(pts).toBe(450);
    });

    it('should track streakLevel across calls', () => {
      manager.addScore(1); // streak 0 → 1
      manager.addScore(1); // streak 1 → 2
      expect(manager.getStreakLevel()).toBe(2);
    });

    it('should reflect last applied multiplier in getComboMultiplier', () => {
      manager.addScore(1); // streak 0, multiplier = 1.0
      manager.addScore(1); // streak 1, multiplier = 1.5
      expect(manager.getComboMultiplier()).toBe(1.5);
    });

    it('should accumulate score across calls with increasing streak', () => {
      manager.addScore(1); // 100
      manager.addScore(1); // 150
      expect(manager.getScore()).toBe(250);
    });

    it('should accumulate totalLinesCleared across calls', () => {
      manager.addScore(2); // 2 lines
      manager.addScore(3); // 3 lines
      expect(manager.getTotalLinesCleared()).toBe(5);
    });
  });

  describe('addExplosionScore', () => {
    it('should add 450 points for 9 blocks cleared', () => {
      const pts = manager.addExplosionScore(9);
      expect(pts).toBe(450);
      expect(manager.getScore()).toBe(450);
    });

    it('should accumulate explosion score into total score', () => {
      manager.addScore(1); // +100
      manager.addExplosionScore(9); // +450
      expect(manager.getScore()).toBe(550);
    });

    it('should add 50 points per block', () => {
      const pts = manager.addExplosionScore(1);
      expect(pts).toBe(50);
    });

    it('should not affect streakLevel', () => {
      manager.addExplosionScore(9);
      expect(manager.getStreakLevel()).toBe(0);
    });
  });

  describe('resetStreak', () => {
    it('should reset streakLevel to 0', () => {
      manager.addScore(1); // streak 0 → 1
      manager.addScore(1); // streak 1 → 2
      manager.resetStreak();
      expect(manager.getStreakLevel()).toBe(0);
    });

    it('should reset comboMultiplier to 1.0', () => {
      manager.addScore(1);
      manager.addScore(1); // multiplier = 1.5
      manager.resetStreak();
      expect(manager.getComboMultiplier()).toBe(1.0);
    });

    it('should leave score unchanged', () => {
      manager.addScore(1); // +100
      manager.resetStreak();
      expect(manager.getScore()).toBe(100);
    });

    it('should leave totalLinesCleared unchanged', () => {
      manager.addScore(3);
      manager.resetStreak();
      expect(manager.getTotalLinesCleared()).toBe(3);
    });

    it('should reset bonus so next clear gets 1.0x again', () => {
      manager.addScore(1); // streak 0 → 1
      manager.addScore(1); // streak 1 → 2, earned 150
      manager.resetStreak(); // streak back to 0
      const pts = manager.addScore(1); // streak 0 → no bonus → 100 pts
      expect(pts).toBe(100);
    });
  });

  describe('resetCombo (deprecated alias for resetStreak)', () => {
    it('should reset comboMultiplier to 1.0', () => {
      manager.addScore(1);
      manager.addScore(1); // multiplier = 1.5
      manager.resetCombo();
      expect(manager.getComboMultiplier()).toBe(1.0);
    });

    it('should leave score unchanged', () => {
      manager.addScore(1); // +100
      manager.resetCombo();
      expect(manager.getScore()).toBe(100);
    });
  });

  describe('reset', () => {
    it('should zero out score', () => {
      manager.addScore(1);
      manager.addScore(1);
      manager.reset();
      expect(manager.getScore()).toBe(0);
    });

    it('should reset streakLevel to 0', () => {
      manager.addScore(1);
      manager.addScore(1); // streak = 2
      manager.reset();
      expect(manager.getStreakLevel()).toBe(0);
    });

    it('should reset comboMultiplier to 1.0', () => {
      manager.addScore(1);
      manager.addScore(1); // multiplier = 1.5
      manager.reset();
      expect(manager.getComboMultiplier()).toBe(1.0);
    });

    it('should reset totalLinesCleared to 0', () => {
      manager.addScore(5);
      manager.reset();
      expect(manager.getTotalLinesCleared()).toBe(0);
    });
  });
});
