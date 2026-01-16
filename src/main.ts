// Entry point - Phase 2

import { Game } from './game/GamePhase2';
import './styles/main.css';

function init() {
  const boardCanvas = document.getElementById('board-canvas') as HTMLCanvasElement;
  const panelCanvas = document.getElementById('panel-canvas') as HTMLCanvasElement;
  const effectsCanvas = document.getElementById('effects-canvas') as HTMLCanvasElement;

  if (!boardCanvas || !panelCanvas || !effectsCanvas) {
    throw new Error('Canvas elements not found');
  }

  const game = new Game(boardCanvas, panelCanvas, effectsCanvas);

  // Setup restart button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      game.restart();
    });
  }

  console.log('Purrfect Blocks Phase 2 initialized! 🐱☕ Drag pieces from panel to board!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
