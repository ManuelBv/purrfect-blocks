// Unit tests for AnimationUtils

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  lerp,
  clamp,
  pingPong,
  smoothstep,
  Tween,
  type TweenConfig,
} from '../../src/utils/AnimationUtils';
import { Easing } from '../../src/utils/Easing';

describe('AnimationUtils', () => {
  describe('lerp', () => {
    it('should interpolate between two values', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should handle negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
      expect(lerp(-50, 50, 0.25)).toBe(-25);
    });

    it('should handle inverted ranges', () => {
      expect(lerp(100, 0, 0.5)).toBe(50);
      expect(lerp(100, 0, 1)).toBe(0);
    });

    it('should handle small decimal steps', () => {
      expect(lerp(10, 20, 0.25)).toBe(12.5);
      expect(lerp(0, 1, 0.333)).toBeCloseTo(0.333, 5);
    });

    it('should handle t values outside 0-1 range', () => {
      expect(lerp(0, 100, -0.5)).toBe(-50); // Extrapolation backward
      expect(lerp(0, 100, 1.5)).toBe(150); // Extrapolation forward
    });

    it('should handle same start and end values', () => {
      expect(lerp(50, 50, 0.5)).toBe(50);
    });
  });

  describe('clamp', () => {
    it('should clamp value to maximum', () => {
      expect(clamp(150, 0, 100)).toBe(100);
      expect(clamp(101, 0, 100)).toBe(100);
    });

    it('should clamp value to minimum', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(-1, 0, 100)).toBe(0);
    });

    it('should not clamp values within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(0, 0, 100)).toBe(0);
      expect(clamp(100, 0, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(clamp(-150, -100, -50)).toBe(-100);
      expect(clamp(-25, -100, -50)).toBe(-50);
      expect(clamp(-75, -100, -50)).toBe(-75);
    });

    it('should handle decimal values', () => {
      expect(clamp(0.333, 0, 1)).toBeCloseTo(0.333, 5);
      expect(clamp(1.5, 0, 1)).toBe(1);
    });
  });

  describe('pingPong', () => {
    it('should return value when going up (0 to length)', () => {
      expect(pingPong(0, 1)).toBe(0);
      expect(pingPong(0.25, 1)).toBe(0.25);
      expect(pingPong(0.5, 1)).toBe(0.5);
      expect(pingPong(0.75, 1)).toBe(0.75);
      expect(pingPong(1, 1)).toBe(1);
    });

    it('should return mirrored value when going down (length to 2*length)', () => {
      expect(pingPong(1.25, 1)).toBe(0.75);
      expect(pingPong(1.5, 1)).toBe(0.5);
      expect(pingPong(1.75, 1)).toBe(0.25);
      expect(pingPong(2, 1)).toBe(0);
    });

    it('should repeat the ping-pong pattern', () => {
      expect(pingPong(2.25, 1)).toBe(0.25);
      expect(pingPong(2.5, 1)).toBe(0.5);
      expect(pingPong(3, 1)).toBe(1);
      expect(pingPong(3.5, 1)).toBe(0.5);
    });

    it('should handle different lengths', () => {
      expect(pingPong(0, 10)).toBe(0);
      expect(pingPong(5, 10)).toBe(5);
      expect(pingPong(10, 10)).toBe(10);
      expect(pingPong(15, 10)).toBe(5);
      expect(pingPong(20, 10)).toBe(0);
    });

    it('should create smooth back-and-forth motion', () => {
      const values: number[] = [];
      for (let t = 0; t <= 4; t += 0.1) {
        values.push(pingPong(t, 1));
      }

      // Should reach maximum
      expect(Math.max(...values)).toBeCloseTo(1, 5);
      // Should reach minimum
      expect(Math.min(...values)).toBeCloseTo(0, 5);
    });
  });

  describe('smoothstep', () => {
    it('should return 0 at lower edge', () => {
      expect(smoothstep(0, 1, 0)).toBe(0);
      expect(smoothstep(10, 20, 10)).toBe(0);
    });

    it('should return 1 at upper edge', () => {
      expect(smoothstep(0, 1, 1)).toBe(1);
      expect(smoothstep(10, 20, 20)).toBe(1);
    });

    it('should return smooth interpolation in middle', () => {
      const value = smoothstep(0, 1, 0.5);
      expect(value).toBe(0.5);
    });

    it('should clamp values outside range', () => {
      expect(smoothstep(0, 1, -0.5)).toBe(0);
      expect(smoothstep(0, 1, 1.5)).toBe(1);
    });

    it('should produce smooth S-curve', () => {
      // Values should accelerate in first quarter
      const v1 = smoothstep(0, 1, 0.25);
      expect(v1).toBeLessThan(0.25);

      // Values should decelerate in last quarter
      const v2 = smoothstep(0, 1, 0.75);
      expect(v2).toBeGreaterThan(0.75);
    });

    it('should work with different ranges', () => {
      expect(smoothstep(0, 100, 50)).toBe(0.5);
      expect(smoothstep(-50, 50, 0)).toBe(0.5);
    });
  });

  describe('Tween', () => {
    let config: TweenConfig;

    beforeEach(() => {
      config = {
        start: 0,
        end: 100,
        duration: 1000,
      };
    });

    describe('constructor', () => {
      it('should create tween with basic config', () => {
        const tween = new Tween(config);
        expect(tween.getCurrentValue()).toBe(0);
        expect(tween.getProgress()).toBe(0);
        expect(tween.isComplete()).toBe(false);
      });

      it('should use linear easing by default', () => {
        const tween = new Tween(config);
        tween.update(500); // 50% progress
        expect(tween.getCurrentValue()).toBe(50);
      });

      it('should accept custom easing function', () => {
        const tweenWithEasing = new Tween({
          ...config,
          easing: Easing.easeInQuad,
        });
        tweenWithEasing.update(500); // 50% progress
        // With easeInQuad, 50% time should give 25% value
        expect(tweenWithEasing.getCurrentValue()).toBeCloseTo(25, 5);
      });
    });

    describe('update', () => {
      it('should update value based on elapsed time', () => {
        const tween = new Tween(config);

        expect(tween.update(0)).toBe(0);
        expect(tween.update(250)).toBe(25);
        expect(tween.update(250)).toBe(50);
        expect(tween.update(500)).toBe(100);
      });

      it('should clamp progress to 1.0', () => {
        const tween = new Tween(config);
        tween.update(2000); // More than duration
        expect(tween.getCurrentValue()).toBe(100);
        expect(tween.getProgress()).toBe(1);
      });

      it('should call onUpdate callback', () => {
        const onUpdate = vi.fn();
        const tween = new Tween({
          ...config,
          onUpdate,
        });

        tween.update(250);
        expect(onUpdate).toHaveBeenCalledWith(25);

        tween.update(250);
        expect(onUpdate).toHaveBeenCalledWith(50);
      });

      it('should call onComplete callback when finished', () => {
        const onComplete = vi.fn();
        const tween = new Tween({
          ...config,
          onComplete,
        });

        tween.update(999);
        expect(onComplete).not.toHaveBeenCalled();

        tween.update(1);
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      it('should not call onComplete multiple times', () => {
        const onComplete = vi.fn();
        const tween = new Tween({
          ...config,
          onComplete,
        });

        tween.update(1000);
        tween.update(100);
        tween.update(100);

        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      it('should return end value when complete', () => {
        const tween = new Tween(config);
        tween.update(1000);

        expect(tween.update(100)).toBe(100);
        expect(tween.update(100)).toBe(100);
      });
    });

    describe('isComplete', () => {
      it('should return false when not complete', () => {
        const tween = new Tween(config);
        expect(tween.isComplete()).toBe(false);

        tween.update(500);
        expect(tween.isComplete()).toBe(false);
      });

      it('should return true when complete', () => {
        const tween = new Tween(config);
        tween.update(1000);
        expect(tween.isComplete()).toBe(true);
      });

      it('should remain true after completion', () => {
        const tween = new Tween(config);
        tween.update(1500);
        expect(tween.isComplete()).toBe(true);

        tween.update(100);
        expect(tween.isComplete()).toBe(true);
      });
    });

    describe('reset', () => {
      it('should reset tween to initial state', () => {
        const tween = new Tween(config);
        tween.update(500);

        expect(tween.getProgress()).toBeGreaterThan(0);
        expect(tween.isComplete()).toBe(false);

        tween.reset();

        expect(tween.getProgress()).toBe(0);
        expect(tween.getCurrentValue()).toBe(0);
        expect(tween.isComplete()).toBe(false);
      });

      it('should allow reusing completed tween', () => {
        const tween = new Tween(config);
        tween.update(1000);
        expect(tween.isComplete()).toBe(true);

        tween.reset();
        expect(tween.isComplete()).toBe(false);

        tween.update(500);
        expect(tween.getCurrentValue()).toBe(50);
      });

      it('should call onComplete again after reset and completion', () => {
        const onComplete = vi.fn();
        const tween = new Tween({
          ...config,
          onComplete,
        });

        tween.update(1000);
        expect(onComplete).toHaveBeenCalledTimes(1);

        tween.reset();
        tween.update(1000);
        expect(onComplete).toHaveBeenCalledTimes(2);
      });
    });

    describe('getProgress', () => {
      it('should return 0 at start', () => {
        const tween = new Tween(config);
        expect(tween.getProgress()).toBe(0);
      });

      it('should return fractional progress during animation', () => {
        const tween = new Tween(config);
        tween.update(250);
        expect(tween.getProgress()).toBe(0.25);

        tween.update(250);
        expect(tween.getProgress()).toBe(0.5);
      });

      it('should return 1 when complete', () => {
        const tween = new Tween(config);
        tween.update(1000);
        expect(tween.getProgress()).toBe(1);
      });

      it('should clamp to 1 even with extra time', () => {
        const tween = new Tween(config);
        tween.update(2000);
        expect(tween.getProgress()).toBe(1);
      });
    });

    describe('getCurrentValue', () => {
      it('should return current interpolated value', () => {
        const tween = new Tween(config);
        expect(tween.getCurrentValue()).toBe(0);

        tween.update(500);
        expect(tween.getCurrentValue()).toBe(50);

        tween.update(500);
        expect(tween.getCurrentValue()).toBe(100);
      });

      it('should not advance animation', () => {
        const tween = new Tween(config);
        tween.update(500);

        const value1 = tween.getCurrentValue();
        const value2 = tween.getCurrentValue();
        const value3 = tween.getCurrentValue();

        expect(value1).toBe(value2);
        expect(value2).toBe(value3);
      });

      it('should reflect easing function', () => {
        const tween = new Tween({
          ...config,
          easing: Easing.easeInQuad,
        });

        tween.update(500);
        expect(tween.getCurrentValue()).toBeCloseTo(25, 5);
      });
    });

    describe('edge cases', () => {
      it('should handle zero duration', () => {
        const tween = new Tween({
          start: 0,
          end: 100,
          duration: 0,
        });

        // With 0 duration, any update should complete immediately
        const value = tween.update(1);
        expect(tween.isComplete()).toBe(true);
        expect(value).toBe(100);
      });

      it('should handle negative ranges', () => {
        const tween = new Tween({
          start: 100,
          end: 0,
          duration: 1000,
        });

        tween.update(500);
        expect(tween.getCurrentValue()).toBe(50);
      });

      it('should handle very small time steps', () => {
        const tween = new Tween(config);

        for (let i = 0; i < 1000; i++) {
          tween.update(1); // 1ms steps
        }

        expect(tween.getCurrentValue()).toBe(100);
        expect(tween.isComplete()).toBe(true);
      });

      it('should handle very large time steps', () => {
        const tween = new Tween(config);
        tween.update(999999);

        expect(tween.getCurrentValue()).toBe(100);
        expect(tween.isComplete()).toBe(true);
      });

      it('should handle decimal time steps', () => {
        const tween = new Tween(config);
        tween.update(333.333);

        expect(tween.getCurrentValue()).toBeCloseTo(33.3333, 2);
      });
    });

    describe('practical scenarios', () => {
      it('should animate position smoothly', () => {
        const positions: number[] = [];
        const tween = new Tween({
          start: 0,
          end: 200,
          duration: 1000,
          easing: Easing.easeInOutQuad,
          onUpdate: (value) => positions.push(value),
        });

        // Simulate 60fps animation
        for (let i = 0; i < 60; i++) {
          tween.update(1000 / 60);
        }

        expect(positions.length).toBe(60);
        expect(positions[0]).toBeCloseTo(0, 0);
        expect(positions[positions.length - 1]).toBeCloseTo(200, 0);
      });

      it('should support chaining animations via onComplete', () => {
        let secondTweenStarted = false;

        const tween1 = new Tween({
          start: 0,
          end: 100,
          duration: 500,
          onComplete: () => {
            secondTweenStarted = true;
          },
        });

        tween1.update(499);
        expect(secondTweenStarted).toBe(false);

        tween1.update(1);
        expect(secondTweenStarted).toBe(true);
      });

      it('should allow creating bounce effect with easeOutBounce', () => {
        const tween = new Tween({
          start: 0,
          end: 100,
          duration: 1000,
          easing: Easing.easeOutBounce,
        });

        const values: number[] = [];
        for (let t = 0; t <= 1000; t += 50) {
          tween.update(50);
          values.push(tween.getCurrentValue());
        }

        // Should reach the end value
        expect(values[values.length - 1]).toBeCloseTo(100, 1);
      });

      it('should allow creating elastic effect with easeOutElastic', () => {
        const tween = new Tween({
          start: 0,
          end: 100,
          duration: 1000,
          easing: Easing.easeOutElastic,
        });

        const values: number[] = [];
        for (let t = 0; t <= 1000; t += 50) {
          tween.update(50);
          values.push(tween.getCurrentValue());
        }

        // Should eventually settle at end value
        expect(values[values.length - 1]).toBeCloseTo(100, 1);
      });
    });
  });

  describe('integration with Easing functions', () => {
    it('should work with all easing functions', () => {
      const easingFunctions = [
        Easing.linear,
        Easing.easeInQuad,
        Easing.easeOutQuad,
        Easing.easeInOutQuad,
        Easing.easeInCubic,
        Easing.easeOutCubic,
        Easing.easeInOutCubic,
        Easing.easeInSine,
        Easing.easeOutSine,
        Easing.easeInOutSine,
        Easing.easeOutElastic,
        Easing.easeOutBounce,
      ];

      easingFunctions.forEach((easing) => {
        const tween = new Tween({
          start: 0,
          end: 100,
          duration: 1000,
          easing,
        });

        tween.update(1000);
        expect(tween.getCurrentValue()).toBeCloseTo(100, 0);
      });
    });

    it('should produce different curves with different easings', () => {
      const createTween = (easing: typeof Easing.linear) =>
        new Tween({
          start: 0,
          end: 100,
          duration: 1000,
          easing,
        });

      const linearTween = createTween(Easing.linear);
      const easeInTween = createTween(Easing.easeInQuad);
      const easeOutTween = createTween(Easing.easeOutQuad);

      linearTween.update(500);
      easeInTween.update(500);
      easeOutTween.update(500);

      const linearValue = linearTween.getCurrentValue();
      const easeInValue = easeInTween.getCurrentValue();
      const easeOutValue = easeOutTween.getCurrentValue();

      expect(linearValue).toBe(50);
      expect(easeInValue).toBeLessThan(linearValue);
      expect(easeOutValue).toBeGreaterThan(linearValue);
    });
  });
});
