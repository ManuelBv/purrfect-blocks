// Animated cat entity with idle and reaction states

export type CatAnimationState = 'IDLE' | 'SITTING' | 'WALKING' | 'SWAT' | 'EXCITED' | 'GAME_OVER';
export type CatType = 'WHITE_LONGHAIR' | 'ORANGE_TABBY';

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

  // Movement for walking animation
  private targetY: number;
  private walkY: number; // Current smooth Y position for vertical patrol
  private walkSpeed: number = 20; // pixels per second for smooth movement
  private isWalkingUp: boolean = false; // Direction of vertical patrol

  // Random offset for independent timing
  private randomOffset: number;

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

    // Random state changes for idle animations
    if (this.stateTimer >= this.nextStateChange && this.isIdleState()) {
      this.transitionToRandomIdleState();
      this.scheduleNextStateChange();
    }

    // Update walking movement - smooth patrol
    if (this.state === 'WALKING') {
      const step = (this.walkSpeed * deltaTime) / 1000;
      const catHeight = this.cellSize * 8;
      const minY = this.boardOffsetY;
      const maxY = this.boardOffsetY + Math.max(0, this.boardHeight - catHeight);

      if (this.isWalkingUp) {
        this.walkY -= step;
        if (this.walkY <= minY) {
          this.walkY = minY;
          this.isWalkingUp = false;
        }
      } else {
        this.walkY += step;
        if (this.walkY >= maxY) {
          this.walkY = maxY;
          this.isWalkingUp = true;
        }
      }

      this.y = this.walkY;
    } else {
      // When not walking, sync walkY with current Y
      this.walkY = this.y;
    }
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

  private isIdleState(): boolean {
    return this.state === 'IDLE' || this.state === 'SITTING' || this.state === 'WALKING';
  }

  private transitionToRandomIdleState(): void {
    const states: CatAnimationState[] = ['IDLE', 'SITTING', 'WALKING'];
    const newState = states[Math.floor(Math.random() * states.length)];

    this.state = newState;
    this.animationFrame = 0;

    // If switching to walking, choose random direction
    if (newState === 'WALKING') {
      this.isWalkingUp = Math.random() > 0.5;
    }
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
}
