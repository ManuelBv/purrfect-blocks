import type { EasingFunction } from './Easing';
import { linear } from './Easing';

/**
 * Linear interpolation between two values
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Progress value between 0 and 1
 * @returns Interpolated value
 *
 * @example
 * lerp(0, 100, 0.5) // Returns 50
 * lerp(10, 20, 0.25) // Returns 12.5
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp a value between minimum and maximum bounds
 * @param value - Value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 *
 * @example
 * clamp(150, 0, 100) // Returns 100
 * clamp(-10, 0, 100) // Returns 0
 * clamp(50, 0, 100) // Returns 50
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Oscillate a value between 0 and length in a ping-pong fashion
 * Useful for creating back-and-forth animations
 * @param t - Time value (can be any positive number)
 * @param length - Maximum value before ping-ponging back
 * @returns Value between 0 and length
 *
 * @example
 * pingPong(0.25, 1) // Returns 0.25
 * pingPong(1.25, 1) // Returns 0.75 (going back down)
 * pingPong(2.25, 1) // Returns 0.25 (going up again)
 */
export function pingPong(t: number, length: number): number {
  const mod = t % (length * 2);
  return mod <= length ? mod : length * 2 - mod;
}

/**
 * Smooth Hermite interpolation (smoothstep)
 * Provides smooth acceleration and deceleration
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Value to interpolate
 * @returns Smoothly interpolated value between 0 and 1
 *
 * @example
 * smoothstep(0, 1, 0.5) // Returns 0.5 with smooth curve
 * smoothstep(0, 100, 50) // Returns 0.5 with smooth curve
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Configuration for a tween animation
 */
export interface TweenConfig {
  /** Starting value */
  start: number;
  /** Ending value */
  end: number;
  /** Duration in milliseconds */
  duration: number;
  /** Easing function to use (defaults to linear) */
  easing?: EasingFunction;
  /** Callback when tween completes */
  onComplete?: () => void;
  /** Callback on each update with current value */
  onUpdate?: (value: number) => void;
}

/**
 * Tween class for managing animated value transitions
 *
 * @example
 * const tween = new Tween({
 *   start: 0,
 *   end: 100,
 *   duration: 1000,
 *   easing: Easing.easeInOutQuad,
 *   onUpdate: (value) => console.log(value),
 *   onComplete: () => console.log('Done!')
 * });
 *
 * // In game loop:
 * const value = tween.update(deltaTime);
 */
export class Tween {
  private start: number;
  private end: number;
  private duration: number;
  private easing: EasingFunction;
  private onComplete?: () => void;
  private onUpdate?: (value: number) => void;
  private elapsed: number = 0;
  private completed: boolean = false;

  constructor(config: TweenConfig) {
    this.start = config.start;
    this.end = config.end;
    this.duration = config.duration;
    this.easing = config.easing || linear;
    this.onComplete = config.onComplete;
    this.onUpdate = config.onUpdate;
  }

  /**
   * Update the tween with elapsed time
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @returns Current interpolated value
   */
  update(deltaTime: number): number {
    if (this.completed) {
      return this.end;
    }

    this.elapsed += deltaTime;
    const t = clamp(this.elapsed / this.duration, 0, 1);
    const easedT = this.easing(t);
    const value = lerp(this.start, this.end, easedT);

    if (this.onUpdate) {
      this.onUpdate(value);
    }

    if (t >= 1) {
      this.completed = true;
      if (this.onComplete) {
        this.onComplete();
      }
    }

    return value;
  }

  /**
   * Check if the tween has completed
   */
  isComplete(): boolean {
    return this.completed;
  }

  /**
   * Reset the tween to start from the beginning
   */
  reset(): void {
    this.elapsed = 0;
    this.completed = false;
  }

  /**
   * Get the current progress (0 to 1)
   */
  getProgress(): number {
    return clamp(this.elapsed / this.duration, 0, 1);
  }

  /**
   * Get the current value without updating
   */
  getCurrentValue(): number {
    const t = clamp(this.elapsed / this.duration, 0, 1);
    const easedT = this.easing(t);
    return lerp(this.start, this.end, easedT);
  }
}
