// Entry point - Phase 2

import { Game } from './game/GamePhase2';
import { PlayerSettingsManager, PlayerSettings, generateUUID } from './utils/playerSettings';
import { generateGreeting } from './utils/kittenMessages';
import './styles/main.css';

let playerSettingsManager: PlayerSettingsManager;
let currentPlayerSettings: PlayerSettings;
let game: Game | null = null;

async function initializePlayerSettings() {
  playerSettingsManager = new PlayerSettingsManager();
  await playerSettingsManager.init();

  let settings = await playerSettingsManager.getPlayerSettings();

  if (!settings) {
    settings = {
      id: 'default',
      name: 'Player',
      uuid: generateUUID(),
      volume: 70,
      muted: false,
    };
    await playerSettingsManager.savePlayerSettings(settings);
  }

  // Ensure volume and muted have default values if not set
  if (settings.volume === undefined) settings.volume = 70;
  if (settings.muted === undefined) settings.muted = false;

  currentPlayerSettings = settings;

  updateSettingsUI();
  updateGreeting();
  updateDevToolsVisibility();
}

function updateSettingsUI() {
  const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
  const playerUuidEl = document.getElementById('player-uuid');
  const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
  const volumeValue = document.getElementById('volume-value');
  const muteToggle = document.getElementById('mute-toggle');
  const devModeCheckbox = document.getElementById('dev-mode-checkbox') as HTMLInputElement;

  if (playerNameInput) {
    playerNameInput.value = currentPlayerSettings.name;
  }
  if (playerUuidEl) {
    playerUuidEl.textContent = currentPlayerSettings.uuid;
  }
  if (volumeSlider && volumeValue) {
    const volume = currentPlayerSettings.volume || 70;
    volumeSlider.value = volume.toString();
    volumeValue.textContent = `${volume}%`;
  }
  if (muteToggle) {
    const isMuted = currentPlayerSettings.muted || false;
    muteToggle.textContent = isMuted ? '🔇' : '🔊';
  }
  if (devModeCheckbox) {
    devModeCheckbox.checked = currentPlayerSettings.devMode || false;
  }
}

function updateDevToolsVisibility() {
  const devToolsArea = document.getElementById('dev-tools-area');
  if (devToolsArea) {
    if (currentPlayerSettings.devMode) {
      devToolsArea.classList.remove('hidden');
    } else {
      devToolsArea.classList.add('hidden');
    }
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

  game = new Game(boardCanvas, panelCanvas, effectsCanvas);

  // Setup restart button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      game!.restart();
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

  // Function to close modal and reset unsaved changes
  const closeModalWithoutSaving = () => {
    // Reset all settings UI to current saved values
    updateSettingsUI();

    // Also reset audio engine to saved values
    const savedVolume = currentPlayerSettings.volume || 70;
    const savedMuted = currentPlayerSettings.muted || false;
    game!.getAudioEngine().setVolume(savedVolume / 100);
    game!.getAudioEngine().setMuted(savedMuted);

    if (settingsModal) {
      settingsModal.classList.add('hidden');
    }
  };

  if (settingsBtnTop && settingsModal) {
    settingsBtnTop.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
      // Refresh UI when opening to show current values
      updateSettingsUI();
    });
  }

  if (settingsCloseBtn && settingsModal) {
    settingsCloseBtn.addEventListener('click', () => {
      closeModalWithoutSaving();
    });

    // Close modal when clicking outside
    settingsModal.addEventListener('click', (event) => {
      if (event.target === settingsModal) {
        closeModalWithoutSaving();
      }
    });
  }

  // Save settings button
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
      const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
      const muteToggle = document.getElementById('mute-toggle');
      const devModeCheckbox = document.getElementById('dev-mode-checkbox') as HTMLInputElement;

      const newName = playerNameInput.value.trim() || 'Player';
      const newVolume = volumeSlider ? parseInt(volumeSlider.value) : 70;
      const isMuted = muteToggle?.textContent === '🔇';
      const devMode = devModeCheckbox?.checked || false;

      // Update settings - UUID is read-only and cannot be changed
      currentPlayerSettings.name = newName;
      currentPlayerSettings.volume = newVolume;
      currentPlayerSettings.muted = isMuted;
      currentPlayerSettings.devMode = devMode;

      await playerSettingsManager.savePlayerSettings(currentPlayerSettings);

      updateGreeting();
      updateDevToolsVisibility();

      if (settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  // Setup volume slider
  const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
  const volumeValue = document.getElementById('volume-value');

  // Initialize volume from saved settings
  if (volumeSlider && volumeValue) {
    const savedVolume = currentPlayerSettings.volume || 70;
    volumeSlider.value = savedVolume.toString();
    volumeValue.textContent = `${savedVolume}%`;
    game.getAudioEngine().setVolume(savedVolume / 100);

    volumeSlider.addEventListener('input', () => {
      const volume = parseInt(volumeSlider.value);
      volumeValue.textContent = `${volume}%`;
      game!.getAudioEngine().setVolume(volume / 100);
    });
  }

  // Setup mute toggle
  const muteToggle = document.getElementById('mute-toggle');

  // Initialize mute state from saved settings
  if (muteToggle) {
    const savedMuted = currentPlayerSettings.muted || false;
    muteToggle.textContent = savedMuted ? '🔇' : '🔊';
    game.getAudioEngine().setMuted(savedMuted);

    muteToggle.addEventListener('click', () => {
      const currentlyMuted = muteToggle.textContent === '🔇';
      const newMutedState = !currentlyMuted;
      game!.getAudioEngine().setMuted(newMutedState);
      muteToggle.textContent = newMutedState ? '🔇' : '🔊';
    });
  }

  // Initialize Performance Monitor
  initPerformanceMonitor();

  console.log('Purrfect Blocks Phase 2 initialized! 🐱☕ Drag pieces from panel to board!');
}

function initPerformanceMonitor() {
  // Performance monitoring removed - cat rendering disabled
  // This function is kept for potential future use
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
