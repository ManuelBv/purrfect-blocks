// Animated cat entity with idle and reaction states

import { Tween } from '../utils/AnimationUtils';
import { easeInOutQuad, easeOutQuad } from '../utils/Easing';
import { CAT_ANIMATION } from '../utils/Constants';

export type CatAnimationState = 'IDLE' | 'SITTING' | 'STANDING' | 'WALKING' | 'SWAT' | 'EXCITED' | 'GAME_OVER' | 'YAWNING' | 'STRETCHING';
export type CatType = 'WHITE_LONGHAIR' | 'ORANGE_TABBY';
export type CatMovementDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export interface CatConfig {
  type: CatType;
  side: 'LEFT' | 'RIGHT';
  boardHeight: number;
  boardWidth: number;
  cellSize: number;
  boardOffsetX?: number;
  boardOffsetY?: number;
}

export class Cat {
  private type: CatType;
  private side: 'LEFT' | 'RIGHT';
  private state: CatAnimationState = 'SITTING';
  private x: number;
  private y: number;
  private animationFrame: number = 0;
  private frameTimer: number = 0;
  private frameDuration: number = 400; // ms per frame (slower animation)
  private stateTimer: number = 0;
  private nextStateChange: number = 0;

  private boardHeight: number;
  private boardWidth: number;
  private cellSize: number;
  private boardOffsetX: number;
  private boardOffsetY: number;

  // Movement for walking animation with easing
  private targetY: number;
  private walkY: number; // Current smooth Y position for vertical patrol
  private isWalkingUp: boolean = false; // Direction of vertical patrol
  private movementTween: Tween | null = null; // Smooth movement tween
  private movementDirection: CatMovementDirection = 'NONE'; // Current movement direction

  // Random offset for independent timing
  private randomOffset: number;

  // Breathing effect offset (random phase for independent breathing)
  private breathingOffset: number;

  // Micro-animation timers
  private earTwitchTimer: number = 0;
  private tailSwishTime: number = 0; // Accumulated time for tail swish

  // Idle variation state tracking
  private previousIdleState: CatAnimationState = 'SITTING'; // State to return to after idle variation
  private idleVariationTimer: number = 0; // Time spent in idle variation

  // State transition tracking
  private transitionTween: Tween | null = null; // Smooth Y offset for state transitions

  constructor(config: CatConfig) {
    this.type = config.type;
    this.side = config.side;
    this.boardHeight = config.boardHeight;
    this.boardWidth = config.boardWidth;
    this.cellSize = config.cellSize;
    this.boardOffsetX = config.boardOffsetX || 0;
    this.boardOffsetY = config.boardOffsetY || 0;

    // Random timing offset for independent animation (0-2 seconds)
    this.randomOffset = Math.random() * 2000;
    this.frameTimer = this.randomOffset;

    // Random breathing phase offset (0 to 2π) for independent breathing
    this.breathingOffset = Math.random() * Math.PI * 2;

    // Position cat on left or right side of board (within the canvas)
    const catWidth = this.cellSize * 8;
    const margin = this.cellSize * 0.5;

    if (this.side === 'LEFT') {
      // Position to the left of the board
      this.x = this.boardOffsetX - catWidth - margin;
    } else {
      // Position to the right of the board
      this.x = this.boardOffsetX + this.boardWidth + margin;
    }

    // Start at random vertical position (add board offset)
    const catHeight = this.cellSize * 8;
    this.y = this.boardOffsetY + Math.random() * Math.max(0, this.boardHeight - catHeight);
    this.walkY = this.y;
    this.targetY = this.y;

    // Schedule first state change
    this.scheduleNextStateChange();
  }

  update(deltaTime: number): void {
    this.frameTimer += deltaTime;
    this.stateTimer += deltaTime;

    // Update animation frame
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % this.getFrameCount();
    }

    // Handle idle variation states (yawning, stretching)
    if (this.isIdleVariation()) {
      this.idleVariationTimer += deltaTime;
      if (this.idleVariationTimer >= CAT_ANIMATION.IDLE_VARIATION_DURATION) {
        // Return to previous idle state
        this.state = this.previousIdleState;
        this.animationFrame = 0;
        this.idleVariationTimer = 0;
      }
    }

    // Handle reaction states (EXCITED, SWAT) returning to idle
    if (this.isReactionState() && this.stateTimer >= this.nextStateChange) {
      this.transitionToRandomIdleState();
      this.scheduleNextStateChange();
    }

    // Random state changes for idle animations
    if (this.stateTimer >= this.nextStateChange && this.isBaseIdleState()) {
      this.transitionToRandomIdleState();
      this.scheduleNextStateChange();
    }

    // Random idle variations from base idle states
    if (this.isBaseIdleState()) {
      const variationChance = CAT_ANIMATION.IDLE_VARIATION_CHANCE * (deltaTime / 1000);
      if (Math.random() < variationChance) {
        this.triggerIdleVariation();
      }
    }

    // Update walking movement with easing
    if (this.state === 'WALKING') {
      // If no tween is active, create one to the opposite boundary
      if (!this.movementTween || this.movementTween.isComplete()) {
        this.startWalkingTween();
      }

      // Update tween and apply position
      if (this.movementTween) {
        this.y = this.movementTween.update(deltaTime);
        this.walkY = this.y;
      }

      // Update movement direction
      this.movementDirection = this.isWalkingUp ? 'UP' : 'DOWN';
    } else {
      // When not walking, clear any active tween
      this.movementTween = null;
      this.movementDirection = 'NONE';
      // When not walking, sync walkY with current Y
      this.walkY = this.y;
    }

    // Update state transition tween if active
    if (this.transitionTween) {
      this.transitionTween.update(deltaTime);
      if (this.transitionTween.isComplete()) {
        this.transitionTween = null;
      }
    }

    // Update micro-animations
    this.updateMicroAnimations(deltaTime);
  }

  /**
   * Update procedural micro-animations (ear twitch, tail swish)
   */
  private updateMicroAnimations(deltaTime: number): void {
    // Ear twitch countdown
    if (this.earTwitchTimer > 0) {
      this.earTwitchTimer -= deltaTime;
    }

    // Randomly trigger ear twitch during base idle states
    if (this.isBaseIdleState() && this.earTwitchTimer <= 0) {
      // Convert chance per second to per-frame chance
      const chanceThisFrame = CAT_ANIMATION.EAR_TWITCH_CHANCE * (deltaTime / 1000);
      if (Math.random() < chanceThisFrame) {
        this.earTwitchTimer = CAT_ANIMATION.EAR_TWITCH_DURATION;
      }
    }

    // Accumulate time for tail swish (continuous oscillation)
    this.tailSwishTime += deltaTime;
  }

  // Trigger reaction to game events
  react(event: 'GAME_START' | 'LINE_CLEAR' | 'COMBO' | 'BOMB' | 'GAME_OVER'): void {
    this.animationFrame = 0;
    this.stateTimer = 0;

    switch (event) {
      case 'GAME_START':
        this.state = 'EXCITED';
        this.nextStateChange = 1500; // Return to idle after 1.5s
        break;
      case 'LINE_CLEAR':
      case 'COMBO':
        this.state = 'SWAT';
        this.nextStateChange = 600; // Quick swat animation
        break;
      case 'BOMB':
        this.state = 'EXCITED';
        this.nextStateChange = 800;
        break;
      case 'GAME_OVER':
        this.state = 'GAME_OVER';
        this.nextStateChange = 9999999; // Stay in this state
        break;
    }
  }

  /**
   * Check if state is a base idle state (not a variation or reaction)
   */
  private isBaseIdleState(): boolean {
    return this.state === 'IDLE' || this.state === 'SITTING' || this.state === 'STANDING' || this.state === 'WALKING';
  }

  /**
   * Check if state is an idle variation (yawning, stretching)
   */
  private isIdleVariation(): boolean {
    return this.state === 'YAWNING' || this.state === 'STRETCHING';
  }

  /**
   * Check if state is a reaction state (temporary states from game events)
   */
  private isReactionState(): boolean {
    return this.state === 'EXCITED' || this.state === 'SWAT';
  }

  /**
   * Trigger a random idle variation animation
   */
  private triggerIdleVariation(): void {
    // Save current state to return to
    this.previousIdleState = this.state;

    // Choose random idle variation
    const variations: CatAnimationState[] = ['YAWNING', 'STRETCHING'];
    const variation = variations[Math.floor(Math.random() * variations.length)];

    this.state = variation;
    this.animationFrame = 0;
    this.idleVariationTimer = 0;
  }

  private transitionToRandomIdleState(): void {
    const currentState = this.state;
    const states: CatAnimationState[] = ['IDLE', 'SITTING', 'STANDING', 'WALKING'];

    // Filter out current state for variety
    const availableStates = states.filter(s => s !== currentState);
    const newState = availableStates[Math.floor(Math.random() * availableStates.length)];

    // Handle transition with easing for SITTING <-> STANDING
    if ((currentState === 'SITTING' && newState === 'STANDING') ||
        (currentState === 'STANDING' && newState === 'SITTING')) {
      this.startStateTransition(currentState, newState);
    }

    this.state = newState;
    this.animationFrame = 0;

    // If switching to walking, start walking tween
    if (newState === 'WALKING') {
      this.isWalkingUp = Math.random() > 0.5;
      this.startWalkingTween();
    }
  }

  /**
   * Start a smooth transition between sitting and standing states
   */
  private startStateTransition(fromState: CatAnimationState, toState: CatAnimationState): void {
    // Create a subtle bounce effect when standing up or sitting down
    const isStandingUp = fromState === 'SITTING' && toState === 'STANDING';
    const startOffset = 0;
    const endOffset = isStandingUp ? -2 : 2; // Slight upward bounce when standing, down when sitting

    this.transitionTween = new Tween({
      start: startOffset,
      end: endOffset,
      duration: CAT_ANIMATION.STATE_TRANSITION_DURATION / 2,
      easing: easeOutQuad,
      onComplete: () => {
        // Settle back to 0
        this.transitionTween = new Tween({
          start: endOffset,
          end: 0,
          duration: CAT_ANIMATION.STATE_TRANSITION_DURATION / 2,
          easing: easeOutQuad,
        });
      },
    });
  }

  /**
   * Create a smooth eased tween for walking movement
   */
  private startWalkingTween(): void {
    const catHeight = this.cellSize * 8;
    const minY = this.boardOffsetY;
    const maxY = this.boardOffsetY + Math.max(0, this.boardHeight - catHeight);

    // Determine target based on direction
    const targetY = this.isWalkingUp ? minY : maxY;
    const distance = Math.abs(targetY - this.y);

    // Calculate duration based on distance and speed (pixels per second)
    const duration = (distance / CAT_ANIMATION.WALK_SPEED) * 1000; // Convert to ms

    // Create tween with easeInOutQuad for smooth acceleration/deceleration
    this.movementTween = new Tween({
      start: this.y,
      end: targetY,
      duration: duration,
      easing: easeInOutQuad,
      onComplete: () => {
        // Reverse direction when reaching boundary
        this.isWalkingUp = !this.isWalkingUp;
        // Next tween will be created on next update
      },
    });
  }

  private scheduleNextStateChange(): void {
    // Random time between 3-8 seconds for next state change (more variation)
    this.stateTimer = 0;
    this.nextStateChange = 3000 + Math.random() * 5000;
  }

  private getFrameCount(): number {
    switch (this.state) {
      case 'SITTING':
        return 2; // Gentle breathing
      case 'STANDING':
        return 2; // Subtle weight shift
      case 'IDLE':
        return 4; // Tail swish, ear twitch
      case 'WALKING':
        return 4; // Walking cycle
      case 'SWAT':
        return 3; // Paw swat
      case 'EXCITED':
        return 4; // Bouncing
      case 'GAME_OVER':
        return 1; // Static sad pose
      case 'YAWNING':
        return 4; // Mouth closed → open → wide → closed
      case 'STRETCHING':
        return 4; // Normal → front stretch → full body → return
      default:
        return 1;
    }
  }

  // Getters for rendering
  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getState(): CatAnimationState {
    return this.state;
  }

  getAnimationFrame(): number {
    return this.animationFrame;
  }

  getType(): CatType {
    return this.type;
  }

  getSide(): 'LEFT' | 'RIGHT' {
    return this.side;
  }

  getSize(): number {
    return this.cellSize * 8; // Cats are 8 cells wide/tall (4x bigger)
  }

  getBreathingOffset(): number {
    return this.breathingOffset;
  }

  /**
   * Check if cat is currently ear twitching
   */
  isEarTwitching(): boolean {
    return this.earTwitchTimer > 0;
  }

  /**
   * Get current tail swish offset in pixels
   * Uses sine wave for smooth oscillation
   */
  getTailSwishOffset(): number {
    // Only apply tail swish during base idle states (not during reactions)
    if (!this.isBaseIdleState() && !this.isIdleVariation()) {
      return 0;
    }

    // Calculate sine wave position based on accumulated time
    const frequency = (2 * Math.PI) / CAT_ANIMATION.TAIL_SWISH_DURATION;
    const phase = this.tailSwishTime * frequency;
    return Math.sin(phase) * CAT_ANIMATION.TAIL_SWISH_AMPLITUDE;
  }

  /**
   * Get breathing Y offset in pixels
   * Uses sine wave with random phase offset for independent breathing
   */
  getBreathingYOffset(): number {
    // Apply breathing during base idle states (including STANDING)
    if (this.state !== 'IDLE' && this.state !== 'SITTING' && this.state !== 'STANDING') {
      return 0;
    }

    // Use accumulated time for breathing cycle
    const frequency = CAT_ANIMATION.BREATHING_FREQUENCY * 2 * Math.PI;
    const phase = (this.stateTimer / 1000) * frequency + this.breathingOffset;
    return Math.sin(phase) * CAT_ANIMATION.BREATHING_AMPLITUDE;
  }

  /**
   * Get current movement direction
   */
  getMovementDirection(): CatMovementDirection {
    return this.movementDirection;
  }

  /**
   * Get state transition Y offset (for smooth sit/stand transitions)
   */
  getTransitionYOffset(): number {
    return this.transitionTween ? this.transitionTween.getCurrentValue() : 0;
  }
}
