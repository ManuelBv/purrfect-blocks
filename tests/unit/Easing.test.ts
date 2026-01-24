// Unit tests for Easing functions

import { describe, it, expect } from 'vitest';
import {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeOutElastic,
  easeOutBounce,
  Easing,
} from '../../src/utils/Easing';

describe('Easing', () => {
  describe('linear', () => {
    it('should return input value unchanged', () => {
      expect(linear(0)).toBe(0);
      expect(linear(0.25)).toBe(0.25);
      expect(linear(0.5)).toBe(0.5);
      expect(linear(0.75)).toBe(0.75);
      expect(linear(1)).toBe(1);
    });
  });

  describe('easeInQuad', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeInQuad(0)).toBe(0);
      expect(easeInQuad(1)).toBe(1);
    });

    it('should accelerate (curve upward)', () => {
      const v1 = easeInQuad(0.25);
      const v2 = easeInQuad(0.5);
      const v3 = easeInQuad(0.75);

      // EaseIn functions start slow and accelerate
      // Values are below linear throughout (slow start)
      expect(v1).toBeLessThan(0.25);
      expect(v2).toBeLessThan(0.5);
      expect(v3).toBeLessThan(0.75);
    });

    it('should produce correct values', () => {
      expect(easeInQuad(0.5)).toBeCloseTo(0.25, 5);
      expect(easeInQuad(0.75)).toBeCloseTo(0.5625, 5);
    });
  });

  describe('easeOutQuad', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeOutQuad(0)).toBe(0);
      expect(easeOutQuad(1)).toBe(1);
    });

    it('should decelerate (curve downward)', () => {
      const v1 = easeOutQuad(0.25);
      const v2 = easeOutQuad(0.5);
      const v3 = easeOutQuad(0.75);

      // EaseOut functions start fast and decelerate
      // Values are above linear throughout (fast start, slow end)
      expect(v1).toBeGreaterThan(0.25);
      expect(v2).toBeGreaterThan(0.5);
      expect(v3).toBeGreaterThan(0.75);
    });

    it('should produce correct values', () => {
      expect(easeOutQuad(0.5)).toBeCloseTo(0.75, 5);
      expect(easeOutQuad(0.25)).toBeCloseTo(0.4375, 5);
    });
  });

  describe('easeInOutQuad', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeInOutQuad(0)).toBe(0);
      expect(easeInOutQuad(1)).toBe(1);
    });

    it('should pass through 0.5 at t=0.5', () => {
      expect(easeInOutQuad(0.5)).toBe(0.5);
    });

    it('should ease in then ease out', () => {
      // First half should ease in (below linear)
      expect(easeInOutQuad(0.25)).toBeLessThan(0.25);
      // Second half should ease out (above linear)
      expect(easeInOutQuad(0.75)).toBeGreaterThan(0.75);
    });
  });

  describe('easeInCubic', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeInCubic(0)).toBe(0);
      expect(easeInCubic(1)).toBe(1);
    });

    it('should accelerate more sharply than quadratic', () => {
      const quad = easeInQuad(0.5);
      const cubic = easeInCubic(0.5);
      expect(cubic).toBeLessThan(quad);
    });

    it('should produce correct values', () => {
      expect(easeInCubic(0.5)).toBeCloseTo(0.125, 5);
      expect(easeInCubic(0.75)).toBeCloseTo(0.421875, 5);
    });
  });

  describe('easeOutCubic', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeOutCubic(0)).toBe(0);
      expect(easeOutCubic(1)).toBe(1);
    });

    it('should decelerate more sharply than quadratic', () => {
      const quad = easeOutQuad(0.5);
      const cubic = easeOutCubic(0.5);
      expect(cubic).toBeGreaterThan(quad);
    });

    it('should produce correct values', () => {
      expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 5);
    });
  });

  describe('easeInOutCubic', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(1)).toBe(1);
    });

    it('should pass through 0.5 at t=0.5', () => {
      expect(easeInOutCubic(0.5)).toBe(0.5);
    });

    it('should ease in then ease out', () => {
      expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
      expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
    });
  });

  describe('easeInSine', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeInSine(0)).toBeCloseTo(0, 5);
      expect(easeInSine(1)).toBeCloseTo(1, 5);
    });

    it('should produce smooth acceleration', () => {
      // EaseIn functions stay below linear
      expect(easeInSine(0.5)).toBeLessThan(0.5);
      expect(easeInSine(0.75)).toBeLessThan(0.75);
    });

    it('should produce correct values', () => {
      expect(easeInSine(0.5)).toBeCloseTo(0.2928932188134524, 5);
    });
  });

  describe('easeOutSine', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeOutSine(0)).toBeCloseTo(0, 5);
      expect(easeOutSine(1)).toBeCloseTo(1, 5);
    });

    it('should produce smooth deceleration', () => {
      expect(easeOutSine(0.5)).toBeGreaterThan(0.5);
    });

    it('should produce correct values', () => {
      expect(easeOutSine(0.5)).toBeCloseTo(0.7071067811865476, 5);
    });
  });

  describe('easeInOutSine', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeInOutSine(0)).toBeCloseTo(0, 5);
      expect(easeInOutSine(1)).toBeCloseTo(1, 5);
    });

    it('should pass through 0.5 at t=0.5', () => {
      expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 5);
    });

    it('should ease in then ease out', () => {
      expect(easeInOutSine(0.25)).toBeLessThan(0.25);
      expect(easeInOutSine(0.75)).toBeGreaterThan(0.75);
    });
  });

  describe('easeOutElastic', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeOutElastic(0)).toBe(0);
      expect(easeOutElastic(1)).toBe(1);
    });

    it('should overshoot slightly before settling', () => {
      // At some point in the middle, value should exceed linear
      let hasOvershoot = false;
      for (let t = 0.5; t < 1; t += 0.05) {
        const value = easeOutElastic(t);
        if (value > 1) {
          hasOvershoot = true;
          break;
        }
      }
      expect(hasOvershoot).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(easeOutElastic(0)).toBe(0);
      expect(easeOutElastic(1)).toBe(1);
    });
  });

  describe('easeOutBounce', () => {
    it('should start at 0 and end at 1', () => {
      expect(easeOutBounce(0)).toBeCloseTo(0, 5);
      expect(easeOutBounce(1)).toBeCloseTo(1, 5);
    });

    it('should bounce (have local minima)', () => {
      // Check that there are points where the curve dips back down
      const values: number[] = [];
      for (let t = 0; t <= 1; t += 0.01) {
        values.push(easeOutBounce(t));
      }

      // Should have at least one local minimum (bounce)
      let hasLocalMinimum = false;
      for (let i = 1; i < values.length - 1; i++) {
        if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
          hasLocalMinimum = true;
          break;
        }
      }
      expect(hasLocalMinimum).toBe(true);
    });

    it('should stay within bounds', () => {
      for (let t = 0; t <= 1; t += 0.1) {
        const value = easeOutBounce(t);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Easing object', () => {
    it('should contain all easing functions', () => {
      expect(Easing.linear).toBe(linear);
      expect(Easing.easeInQuad).toBe(easeInQuad);
      expect(Easing.easeOutQuad).toBe(easeOutQuad);
      expect(Easing.easeInOutQuad).toBe(easeInOutQuad);
      expect(Easing.easeInCubic).toBe(easeInCubic);
      expect(Easing.easeOutCubic).toBe(easeOutCubic);
      expect(Easing.easeInOutCubic).toBe(easeInOutCubic);
      expect(Easing.easeInSine).toBe(easeInSine);
      expect(Easing.easeOutSine).toBe(easeOutSine);
      expect(Easing.easeInOutSine).toBe(easeInOutSine);
      expect(Easing.easeOutElastic).toBe(easeOutElastic);
      expect(Easing.easeOutBounce).toBe(easeOutBounce);
    });

    it('should allow accessing functions via object notation', () => {
      const easingFunction = Easing.easeInOutQuad;
      expect(easingFunction(0.5)).toBe(0.5);
    });
  });

  describe('Edge cases and consistency', () => {
    const allEasingFunctions = [
      linear,
      easeInQuad,
      easeOutQuad,
      easeInOutQuad,
      easeInCubic,
      easeOutCubic,
      easeInOutCubic,
      easeInSine,
      easeOutSine,
      easeInOutSine,
      easeOutElastic,
      easeOutBounce,
    ];

    const functionNames = [
      'linear',
      'easeInQuad',
      'easeOutQuad',
      'easeInOutQuad',
      'easeInCubic',
      'easeOutCubic',
      'easeInOutCubic',
      'easeInSine',
      'easeOutSine',
      'easeInOutSine',
      'easeOutElastic',
      'easeOutBounce',
    ];

    allEasingFunctions.forEach((fn, index) => {
      describe(`${functionNames[index]} edge cases`, () => {
        it('should handle t=0', () => {
          const result = fn(0);
          expect(result).toBeCloseTo(0, 5);
        });

        it('should handle t=1', () => {
          const result = fn(1);
          expect(result).toBeCloseTo(1, 5);
        });

        it('should be monotonically increasing (generally)', () => {
          // Sample points and check general trend
          const samples = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
          const values = samples.map(fn);

          // First value should be less than last value
          expect(values[0]).toBeLessThan(values[values.length - 1]);
        });
      });
    });
  });

  describe('Practical usage scenarios', () => {
    it('should interpolate position from 0 to 100', () => {
      const start = 0;
      const end = 100;
      const t = 0.5;

      const linearValue = start + (end - start) * linear(t);
      const easedValue = start + (end - start) * easeInOutQuad(t);

      expect(linearValue).toBe(50);
      expect(easedValue).toBe(50);
    });

    it('should work with negative ranges', () => {
      const start = -50;
      const end = 50;
      const t = 0.5;

      const value = start + (end - start) * linear(t);
      expect(value).toBe(0);
    });

    it('should allow creating smooth animations', () => {
      const duration = 1000; // ms
      const currentTime = 500; // ms
      const t = currentTime / duration;

      const position = 0 + (100 - 0) * easeInOutQuad(t);
      expect(position).toBe(50);
    });
  });
});
