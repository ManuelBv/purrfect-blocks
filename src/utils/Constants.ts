// Game constants

export const GRID_CONFIG = {
  ROWS: 8,
  COLS: 8,

  // Desktop: Board takes ~45% of screen height
  DESKTOP_BOARD_HEIGHT_RATIO: 0.45,

  // Mobile: Board takes ~37.5% of screen height (25% smaller than desktop for better fit)
  // With header (60px), HUD (40px), controls (40px), padding (50px) = ~190px reserved
  MOBILE_BOARD_HEIGHT_RATIO: 0.375,

  // Breakpoint
  MOBILE_BREAKPOINT: 768,
} as const;

export const PIECE_CONFIG = {
  PANEL_SIZE: 3, // Number of pieces in selection panel
  POOL_SIZE: 50, // Object pool size for piece reuse
} as const;

export const SCORING = {
  BASE_SCORE_PER_LINE: 100,
  CASCADE_BONUS_MULTIPLIER: 0.5, // +50% per cascade level
} as const;

export const ANIMATION = {
  FPS_TARGET: 60,
  FALL_SPEED: 500, // milliseconds for blocks to fall one row
  CLEAR_ANIMATION_DURATION: 300, // milliseconds for line clear animation
} as const;

export const CAT_ANIMATION = {
  // Movement
  WALK_SPEED: 20, // pixels per second
  WALK_EASE: 'easeInOutQuad' as const, // Easing function name for walking

  // State transitions
  STATE_TRANSITION_DURATION: 500, // milliseconds for state changes (sit ↔ stand)

  // Breathing effect (for sitting/idle states)
  BREATHING_AMPLITUDE: 1.5, // pixels of vertical movement
  BREATHING_FREQUENCY: 0.5, // Hz (cycles per second) - slow, calm breathing

  // Idle variations (yawn, stretch, groom)
  IDLE_VARIATION_CHANCE: 0.02, // 2% chance per second
  IDLE_VARIATION_DURATION: 1000, // milliseconds for idle variation animations

  // Ear twitch
  EAR_TWITCH_CHANCE: 0.03, // 3% chance per second
  EAR_TWITCH_DURATION: 250, // milliseconds

  // Tail swish
  TAIL_SWISH_DURATION: 1500, // milliseconds for one complete swish cycle
  TAIL_SWISH_AMPLITUDE: 2, // pixels of tail movement
} as const;

export const STORAGE = {
  AUTO_SAVE_DEBOUNCE: 300, // milliseconds
  DB_NAME: 'PurrfectBlocksDB',
  STORE_NAME: 'gameState',
} as const;

export function calculateCellSize(): number {
  const isMobile = window.innerWidth < GRID_CONFIG.MOBILE_BREAKPOINT;
  const ratio = isMobile
    ? GRID_CONFIG.MOBILE_BOARD_HEIGHT_RATIO
    : GRID_CONFIG.DESKTOP_BOARD_HEIGHT_RATIO;

  const availableHeight = window.innerHeight * ratio;
  return Math.floor(availableHeight / GRID_CONFIG.ROWS);
}

export function calculateBoardDimensions() {
  const cellSize = calculateCellSize();
  return {
    width: GRID_CONFIG.COLS * cellSize,
    height: GRID_CONFIG.ROWS * cellSize,
    cellSize,
  };
}
