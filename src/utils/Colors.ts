// Coffee shop color palette

export const COLORS = {
  ESPRESSO: '#3E2723',
  BURNT_ORANGE: '#D84315',
  CREAM: '#FFF8E1',
  MOCHA: '#6D4C41',
  CARAMEL: '#A1887F',
  LATTE: '#BCAAA4',
} as const;

export const DARK_MODE_COLORS = {
  ESPRESSO: '#1A1A1A',
  BURNT_ORANGE: '#FF5722',
  CREAM: '#2C2C2C',
  MOCHA: '#4E342E',
  CARAMEL: '#8D6E63',
  LATTE: '#795548',
} as const;

export function getColors(darkMode: boolean) {
  return darkMode ? DARK_MODE_COLORS : COLORS;
}

// Piece colors array for assignment
export const PIECE_COLORS = [
  COLORS.ESPRESSO,
  COLORS.BURNT_ORANGE,
  COLORS.MOCHA,
  COLORS.CARAMEL,
  COLORS.LATTE,
];

// UI Colors
export const UI_COLORS = {
  VALID_PLACEMENT: '#4CAF50',   // Green
  INVALID_PLACEMENT: '#F44336', // Red
  GHOST: 'rgba(255, 255, 255, 0.3)',
  GRID_LINE: '#8D6E63',
  BACKGROUND: COLORS.CREAM,
  TEXT: COLORS.ESPRESSO,
} as const;
