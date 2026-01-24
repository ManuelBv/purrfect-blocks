/**
 * Robert Penner's Easing Functions
 *
 * All functions take a normalized time parameter t (0 to 1) and return
 * a normalized eased value (0 to 1).
 *
 * Usage:
 * ```typescript
 * const t = (currentTime - startTime) / duration;
 * const easedValue = Easing.easeInOutQuad(t);
 * const position = start + (end - start) * easedValue;
 * ```
 */

export type EasingFunction = (t: number) => number;

/**
 * No easing, linear interpolation
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function linear(t: number): number {
  return t;
}

/**
 * Quadratic easing in - accelerating from zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Quadratic easing out - decelerating to zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * Quadratic easing in/out - acceleration until halfway, then deceleration
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Cubic easing in - accelerating from zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * Cubic easing out - decelerating to zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeOutCubic(t: number): number {
  return --t * t * t + 1;
}

/**
 * Cubic easing in/out - acceleration until halfway, then deceleration
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/**
 * Sinusoidal easing in - accelerating from zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInSine(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

/**
 * Sinusoidal easing out - decelerating to zero velocity
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

/**
 * Sinusoidal easing in/out - acceleration until halfway, then deceleration
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Elastic easing out - elastic snap effect at the end
 * Creates a spring-like overshoot and settle effect
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1 (may slightly overshoot)
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;

  if (t === 0) return 0;
  if (t === 1) return 1;

  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Bounce easing out - bouncing effect at the end
 * Creates a ball-bounce effect
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Object containing all easing functions for convenient access
 */
export const Easing = {
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
} as const;
