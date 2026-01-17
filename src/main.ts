// Entry point - Phase 2

import { Game } from './game/GamePhase2';
import { PlayerSettingsManager, PlayerSettings, generateUUID } from './utils/playerSettings';
import { generateGreeting } from './utils/kittenMessages';
import './styles/main.css';

let playerSettingsManager: PlayerSettingsManager;
let currentPlayerSettings: PlayerSettings;

async function initializePlayerSettings() {
  playerSettingsManager = new PlayerSettingsManager();
  await playerSettingsManager.init();

  let settings = await playerSettingsManager.getPlayerSettings();

  if (!settings) {
    settings = {
      id: 'default',
      name: 'Player',
      uuid: generateUUID(),
    };
    await playerSettingsManager.savePlayerSettings(settings);
  }

  currentPlayerSettings = settings;

  updateSettingsUI();
  updateGreeting();
}

function updateSettingsUI() {
  const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
  const playerUuidEl = document.getElementById('player-uuid');

  if (playerNameInput) {
    playerNameInput.value = currentPlayerSettings.name;
  }
  if (playerUuidEl) {
    playerUuidEl.textContent = currentPlayerSettings.uuid;
  }
}

function updateGreeting() {
  const greetingEl = document.getElementById('player-greeting');
  if (greetingEl) {
    greetingEl.textContent = generateGreeting(currentPlayerSettings.name);
  }
}

async function init() {
  // Initialize player settings first
  await initializePlayerSettings();

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

  // Setup fullscreen buttons
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    });
  }

  if (exitFullscreenBtn) {
    exitFullscreenBtn.addEventListener('click', () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    });
  }

  // Toggle button visibility based on fullscreen state
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      if (fullscreenBtn) fullscreenBtn.style.display = 'none';
      if (exitFullscreenBtn) exitFullscreenBtn.style.display = 'inline-block';
    } else {
      if (fullscreenBtn) fullscreenBtn.style.display = 'inline-block';
      if (exitFullscreenBtn) exitFullscreenBtn.style.display = 'none';
    }
  });

  // Setup settings button and modal
  const settingsBtnTop = document.getElementById('settings-btn-top');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');

  if (settingsBtnTop && settingsModal) {
    settingsBtnTop.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });
  }

  if (settingsCloseBtn && settingsModal) {
    settingsCloseBtn.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    settingsModal.addEventListener('click', (event) => {
      if (event.target === settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  // Save settings button
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
      const newName = playerNameInput.value.trim() || 'Player';

      currentPlayerSettings.name = newName;
      await playerSettingsManager.savePlayerSettings(currentPlayerSettings);

      updateGreeting();

      if (settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  // Setup volume slider
  const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
  const volumeValue = document.getElementById('volume-value');

  if (volumeSlider && volumeValue) {
    volumeSlider.addEventListener('input', () => {
      const volume = parseInt(volumeSlider.value);
      volumeValue.textContent = `${volume}%`;
      game.getAudioEngine().setVolume(volume / 100);
    });
  }

  // Setup mute toggle
  const muteToggle = document.getElementById('mute-toggle');
  let isMuted = false;

  if (muteToggle) {
    muteToggle.addEventListener('click', () => {
      isMuted = !isMuted;
      game.getAudioEngine().setMuted(isMuted);
      muteToggle.textContent = isMuted ? '🔇 Muted' : '🔊 Unmuted';
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
