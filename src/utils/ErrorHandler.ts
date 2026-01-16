// Error handling utilities

export enum ErrorCode {
  STORAGE_FAILED = 'ERR_001',
  RENDER_FAILED = 'ERR_002',
  AUDIO_FAILED = 'ERR_003',
  INVALID_PLACEMENT = 'ERR_004',
  PIECE_GENERATION_FAILED = 'ERR_005',
}

export class GameError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export function handleError(error: GameError | Error): void {
  if (error instanceof GameError) {
    console.error(`[${error.code}] ${error.message}`, error.stack);
    // Toast notification will be implemented in UI phase
    console.log(`User message: ${error.userMessage}`);
  } else {
    console.error('Unexpected error:', error);
    console.log('User message: Something went wrong. Please try again.');
  }
}
