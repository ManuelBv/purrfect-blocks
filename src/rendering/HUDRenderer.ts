// Renders score and combo HUD

export class HUDRenderer {
  updateScore(score: number): void {
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.textContent = score.toString();
    }
  }

  updateCombo(multiplier: number): void {
    const comboEl = document.getElementById('combo');
    if (comboEl) {
      comboEl.textContent = `${multiplier.toFixed(1)}x`;

      // Add animation class for combo changes
      if (multiplier > 1.0) {
        comboEl.classList.add('combo-active');
      } else {
        comboEl.classList.remove('combo-active');
      }
    }
  }

  updateHighScore(highScore: number): void {
    const highScoreEl = document.getElementById('high-score-display');
    if (highScoreEl) {
      highScoreEl.textContent = highScore.toString();
    }
  }

  showMessage(message: string, duration: number = 2000): void {
    // Create temporary message element
    const msgEl = document.createElement('div');
    msgEl.className = 'game-message';
    msgEl.textContent = message;
    document.body.appendChild(msgEl);

    setTimeout(() => {
      msgEl.remove();
    }, duration);
  }
}
