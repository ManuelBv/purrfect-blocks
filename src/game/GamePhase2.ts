// Phase 2: Enhanced game controller with drag-drop and animations

import { GameBoard } from './GameBoard';
import { ScoreManager } from './ScoreManager';
import { CascadeEngine } from './CascadeEngine';
import { PieceManager } from './PieceManager';
import { BoardRenderer } from '../rendering/BoardRenderer';
import { PanelRenderer } from '../rendering/PanelRenderer';
import { EffectsRenderer } from '../rendering/EffectsRenderer';
import { HUDRenderer } from '../rendering/HUDRenderer';
import { AnimationLoop } from '../rendering/AnimationLoop';
import { InputManager } from '../input/InputManager';
import { PieceRenderer } from '../rendering/PieceRenderer';
import { GhostPreview } from '../input/GhostPreview';
import { ClearAnimationManager } from '../rendering/ClearAnimationManager';
import { GameState } from '../types/GameTypes';
import type { VisualEffect } from '../types/RenderTypes';
import type { Piece } from '../pieces/Piece';
import { clearBoardCanvas } from '../utils/CanvasUtils';
import { GameStorage } from '../storage/GameStorage';
import { AudioEngine } from '../audio/AudioEngine';
import { SoundEffects } from '../audio/SoundEffects';

export class Game {
  private board: GameBoard;
  private scoreManager: ScoreManager;
  private cascadeEngine: CascadeEngine;
  private pieceManager: PieceManager;

  private boardRenderer: BoardRenderer;
  private panelRenderer: PanelRenderer;
  private effectsRenderer: EffectsRenderer;
  private hudRenderer: HUDRenderer;
  private animationLoop: AnimationLoop;
  private inputManager: InputManager;

  private gameState: GameState = GameState.LOADING;
  private effects: VisualEffect[] = [];
  private animatingCascade: boolean = false;
  private clearAnimationManager: ClearAnimationManager;

  private gameStorage: GameStorage;
  private autoSaveTimeout: number | null = null;
  private storageAvailable: boolean = false;

  private audioEngine: AudioEngine;
  private soundEffects: SoundEffects;

  constructor(
    boardCanvas: HTMLCanvasElement,
    panelCanvas: HTMLCanvasElement,
    effectsCanvas: HTMLCanvasElement
  ) {
    this.board = new GameBoard();
    this.scoreManager = new ScoreManager();
    this.cascadeEngine = new CascadeEngine();
    this.pieceManager = new PieceManager();

    // Setup renderers
    this.boardRenderer = new BoardRenderer(boardCanvas);
    const cellSize = this.boardRenderer.getCellSize();

    this.panelRenderer = new PanelRenderer(panelCanvas, cellSize);
    this.effectsRenderer = new EffectsRenderer(effectsCanvas, cellSize);
    this.hudRenderer = new HUDRenderer();
    this.clearAnimationManager = new ClearAnimationManager();

    // Setup effects canvas to cover entire game area
    this.setupEffectsCanvas(effectsCanvas);

    // Setup input
    this.inputManager = new InputManager(boardCanvas, cellSize);
    this.inputManager.setPanelCanvas(panelCanvas);
    this.inputManager.setCallbacks(
      this.handlePiecePlaced.bind(this),
      this.handlePieceSelected.bind(this)
    );

    // Setup panel click and touch handlers
    panelCanvas.addEventListener('mousedown', this.handlePanelClick.bind(this));
    panelCanvas.addEventListener('touchstart', this.handlePanelTouch.bind(this), { passive: false });

    // Global touch handlers for continuous dragging (like mouse events)
    document.addEventListener('touchmove', this.handleGlobalTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleGlobalTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.handleGlobalTouchEnd.bind(this), { passive: false });

    this.animationLoop = new AnimationLoop(this.update.bind(this));

    this.gameStorage = new GameStorage();

    // Initialize audio
    this.audioEngine = new AudioEngine();
    this.audioEngine.init();
    this.soundEffects = new SoundEffects(this.audioEngine);

    // Resume audio on first user interaction
    document.addEventListener('click', () => {
      this.audioEngine.resume();
    }, { once: true });

    // Setup audio test buttons
    this.setupAudioTestButtons();

    this.init();
  }

  private setupEffectsCanvas(canvas: HTMLCanvasElement): void {
    const gameArea = document.querySelector('.game-area') as HTMLElement;
    if (!gameArea) return;

    // Get the actual dimensions of the game area
    const rect = gameArea.getBoundingClientRect();

    // Size canvas to cover entire game area
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }

  private async init(): Promise<void> {
    console.log('Game init starting...');

    // Initialize storage with auto-recovery for corruption
    try {
      console.log('Initializing storage...');
      await this.gameStorage.init();
      console.log('Storage initialized successfully');
      this.storageAvailable = true;
    } catch (error) {
      console.warn('Database initialization failed, skipping storage:', error);
      this.storageAvailable = false;
      // Continue without storage - game will work fine
    }

    // Load and display high score
    const storedHighScore = localStorage.getItem('purrfectBlocksHighScore');
    const highScore = storedHighScore ? parseInt(storedHighScore) : 0;
    this.hudRenderer.updateHighScore(highScore);
    console.log('High score loaded:', highScore);

    // Try to load saved game only if storage is available
    if (this.storageAvailable) {
      try {
        console.log('Attempting to load saved game...');
        const savedGame = await this.gameStorage.loadGame();

        if (savedGame) {
          console.log('Restoring saved game from', new Date(savedGame.timestamp).toLocaleString());
          this.restoreGameState(savedGame);
        } else {
          console.log('No saved game found, starting fresh');
        }
      } catch (error) {
        console.warn('Failed to load saved game, starting fresh:', error);
      }
    } else {
      console.log('Storage not available, starting fresh game');
    }

    this.gameState = GameState.PLAYING;

    // Debug: Check if pieces exist
    const pieces = this.pieceManager.getAvailablePieces();
    console.log('Available pieces after init:', pieces.length, pieces);

    this.animationLoop.start();
    this.render();
    console.log('Game init complete!');
  }

  private setupAudioTestButtons(): void {
    const buttons = [
      { id: 'test-piece-placed', handler: () => this.soundEffects.playPiecePlaced() },
      { id: 'test-line-clear', handler: () => this.soundEffects.playLineClear() },
      { id: 'test-cascade-2x', handler: () => this.soundEffects.playCascade(2) },
      { id: 'test-cascade-3x', handler: () => this.soundEffects.playCascade(3) },
      { id: 'test-cascade-4x', handler: () => this.soundEffects.playCascade(4) },
      { id: 'test-game-over', handler: () => this.soundEffects.playGameOver() },
      { id: 'test-success', handler: () => this.soundEffects.playSuccess() },
      { id: 'test-invalid', handler: () => this.soundEffects.playInvalid() },
    ];

    buttons.forEach(({ id, handler }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', handler);
      }
    });
  }

  private update(deltaTime: number): void {
    if (this.gameState !== GameState.PLAYING) return;

    // Update drag state with current board
    const dragHandler = this.inputManager.getDragHandler();
    if (dragHandler.isDragging()) {
      const dragState = dragHandler.getDragState();
      dragHandler.updateDrag(
        dragState.currentX,
        dragState.currentY,
        this.board,
        this.boardRenderer.getCellSize()
      );
    }

    // Update effects
    this.updateEffects(deltaTime);

    // Render everything
    this.render();
  }

  private render(): void {
    // Render board with clear animations
    this.renderBoardWithAnimations();

    // Render piece panel
    this.panelRenderer.render(
      this.pieceManager.getAvailablePieces(),
      this.pieceManager.getSelectedIndex()
    );

    // Render effects
    this.effectsRenderer.render(this.effects);

    // Render dragging piece with ghost preview
    this.renderDraggedPiece();

    // Update HUD
    this.hudRenderer.updateScore(this.scoreManager.getScore());
    this.hudRenderer.updateCombo(this.scoreManager.getComboMultiplier());
  }

  private renderBoardWithAnimations(): void {
    const cells = this.board.getCells();
    const ctx = this.boardRenderer['ctx'];
    const cellSize = this.boardRenderer.getCellSize();

    // Clear and draw grid
    clearBoardCanvas(ctx);
    this.boardRenderer['drawGrid']();

    // Draw all cells
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        const cell = cells[r][c];

        if (cell.occupied && cell.color) {
          const progress = this.clearAnimationManager.getBlockProgress(r, c);

          if (progress !== null && progress < 1) {
            // Cell is animating - draw with break animation
            this.boardRenderer.drawCellWithAnimation(r, c, cell.color, progress);
          } else if (progress === null) {
            // Cell is not animating - draw normally
            this.boardRenderer['drawCell'](r, c, cell.color);
          }
          // If progress === 1, cell is fully cleared, don't draw
        }
      }
    }
  }

  private renderDraggedPiece(): void {
    const dragState = this.inputManager.getDragHandler().getDragState();

    if (dragState.isDragging && dragState.piece) {
      const effectsCtx = this.effectsRenderer['ctx'];
      const cellSize = this.boardRenderer.getCellSize();

      // Clear entire effects canvas
      effectsCtx.clearRect(0, 0, effectsCtx.canvas.width, effectsCtx.canvas.height);

      // Get board canvas position within game area
      const gameArea = document.querySelector('.game-area') as HTMLElement;
      const boardCanvas = this.boardRenderer['ctx'].canvas;

      if (gameArea && boardCanvas) {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const boardRect = boardCanvas.getBoundingClientRect();

        // Calculate board offset within game area (effects canvas coordinates)
        const boardOffsetX = boardRect.left - gameAreaRect.left;
        const boardOffsetY = boardRect.top - gameAreaRect.top;

        // Draw ghost preview on board (with offset)
        effectsCtx.save();
        effectsCtx.translate(boardOffsetX, boardOffsetY);

        GhostPreview.render(
          effectsCtx,
          dragState.piece.shape,
          dragState.gridRow,
          dragState.gridCol,
          cellSize,
          dragState.isValid
        );

        effectsCtx.restore();

        // Draw piece following cursor (in game-area space)
        // dragState coordinates are relative to board canvas, so add board offset
        // For touch: apply -50% offset so finger doesn't cover the piece
        const dims = PieceRenderer.getPieceDimensions(dragState.piece.shape, cellSize);
        const touchOffsetX = dragState.isTouch ? -dims.width * 0.5 : 0;
        const touchOffsetY = dragState.isTouch ? -dims.height * 0.5 : 0;

        PieceRenderer.renderPiece(
          effectsCtx,
          dragState.piece,
          dragState.currentX + boardOffsetX - cellSize + touchOffsetX,
          dragState.currentY + boardOffsetY - cellSize + touchOffsetY,
          cellSize,
          0.8
        );
      }
    }
  }

  private handlePanelClick(event: MouseEvent): void {
    if (this.gameState !== GameState.PLAYING) return;

    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const slotIndex = this.panelRenderer.getSlotIndexFromCoordinates(x, y);

    if (slotIndex >= 0) {
      const piece = this.pieceManager.selectPiece(slotIndex);
      if (piece) {
        // Start dragging this piece
        this.inputManager.startDragFromPanel(piece, event);
      }
    }
  }

  private handlePanelTouch(event: TouchEvent): void {
    if (this.gameState !== GameState.PLAYING) return;
    event.preventDefault();

    if (event.touches.length === 0) return;

    const touch = event.touches[0];
    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const slotIndex = this.panelRenderer.getSlotIndexFromCoordinates(x, y);

    if (slotIndex >= 0) {
      const piece = this.pieceManager.selectPiece(slotIndex);
      if (piece) {
        // Create a MouseEvent-like object for compatibility with startDragFromPanel
        const mouseEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY
        } as MouseEvent;

        // Start dragging this piece (mark as touch for offset)
        this.inputManager.startDragFromPanel(piece, mouseEvent, true);
      }
    }
  }

  private handleGlobalTouchMove(event: TouchEvent): void {
    const dragHandler = this.inputManager.getDragHandler();
    if (!dragHandler.isDragging()) return;

    event.preventDefault();

    if (event.touches.length === 0) return;

    const touch = event.touches[0];
    const boardCanvas = this.boardRenderer.getCanvas();
    const rect = boardCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Update drag position (same as mouse move)
    dragHandler['dragState'].currentX = x;
    dragHandler['dragState'].currentY = y;
  }

  private handleGlobalTouchEnd(event: TouchEvent): void {
    const dragHandler = this.inputManager.getDragHandler();
    if (!dragHandler.isDragging()) return;

    event.preventDefault();

    const result = dragHandler.endDrag();

    if (result) {
      this.handlePiecePlaced(result.piece, result.row, result.col);
    }
  }

  private handlePieceSelected(index: number): void {
    this.pieceManager.selectPiece(index);
  }

  private handlePiecePlaced(piece: Piece, row: number, col: number): void {
    if (this.animatingCascade) return;

    // Play piece placement sound
    this.soundEffects.playPiecePlaced();

    // Place piece on board
    this.board.placePiece(piece.shape, row, col, piece.color, piece.id);

    // Consume the piece from manager
    const selectedIndex = this.pieceManager.getSelectedIndex();
    if (selectedIndex >= 0) {
      this.pieceManager.consumePiece(selectedIndex);
    }

    // Process cascades with animation
    this.processCascadeWithAnimation();
  }

  private async processCascadeWithAnimation(): Promise<void> {
    this.animatingCascade = true;
    this.cascadeEngine.reset();

    // Add a brief delay to show the placed piece
    await this.delay(200);

    let totalLinesCleared = 0;

    // Process cascades one at a time with animation
    while (true) {
      // Detect lines to clear
      const lines = this.cascadeEngine.detectLines(this.board);

      if (!lines) {
        // No more lines to clear
        break;
      }

      console.log('Starting clear animation for', lines.rows.length, 'rows and', lines.cols.length, 'cols');

      // Play line clear sound at the start of the animation
      this.soundEffects.playLineClear();

      // Schedule the clear animation
      this.clearAnimationManager.scheduleClearing(lines.rows, lines.cols, this.board);

      // Wait for animation to complete
      const animDuration = this.clearAnimationManager.getTotalDuration();
      console.log('Animation duration:', animDuration, 'ms');

      // Wait while animation is playing
      const startTime = Date.now();
      while (this.clearAnimationManager.isAnimating()) {
        await this.delay(16); // Wait one frame
      }
      console.log('Animation completed after', Date.now() - startTime, 'ms');

      // Actually clear the lines from the board
      const linesCleared = this.cascadeEngine.clearLines(this.board, lines);
      totalLinesCleared += linesCleared;

      // Clear animation state
      this.clearAnimationManager.clear();

      // Small delay between cascade levels
      await this.delay(100);
    }

    // Calculate score
    if (totalLinesCleared > 0) {
      const cascadeLevel = this.cascadeEngine.getCascadeLevel();
      const score = this.scoreManager.addScore(totalLinesCleared, cascadeLevel);

      // Play cascade sound if cascade level > 1
      if (cascadeLevel > 1) {
        this.soundEffects.playCascade(cascadeLevel);
        this.hudRenderer.showMessage(`${cascadeLevel}x CASCADE! +${score}`);
      }
    } else {
      // Reset combo if no lines cleared
      this.scoreManager.resetCombo();
    }

    this.animatingCascade = false;

    // Auto-save the game state
    this.scheduleAutoSave();

    // Check game over after cascades complete and new pieces are available
    if (!this.pieceManager.hasPlayablePieces(this.board)) {
      console.log('Game Over: No playable pieces');
      this.gameOver();
    }
  }

  private updateEffects(deltaTime: number): void {
    // Update effect progress
    this.effects = this.effects.filter(effect => {
      effect.progress += deltaTime / 1000; // Convert to seconds
      return effect.progress < 1.0; // Remove completed effects
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async gameOver(): Promise<void> {
    this.gameState = GameState.GAME_OVER;
    this.animationLoop.stop();

    // Play game over sound
    this.soundEffects.playGameOver();

    const finalScore = this.scoreManager.getScore();

    // Get/update high score from localStorage
    const storedHighScore = localStorage.getItem('purrfectBlocksHighScore');
    const highScore = storedHighScore ? parseInt(storedHighScore) : 0;
    const newHighScore = Math.max(finalScore, highScore);

    if (newHighScore > highScore) {
      localStorage.setItem('purrfectBlocksHighScore', newHighScore.toString());
      // Update displayed high score
      this.hudRenderer.updateHighScore(newHighScore);
    }

    // Wait 200ms before showing modal
    await this.delay(200);

    // Show modal
    this.showGameOverModal(finalScore, newHighScore);
  }

  private showGameOverModal(score: number, highScore: number): void {
    const modal = document.getElementById('game-over-modal');
    const finalScoreEl = document.getElementById('final-score');
    const highScoreEl = document.getElementById('high-score');
    const playAgainBtn = document.getElementById('play-again-btn');
    const closeBtn = document.getElementById('modal-close-btn');

    if (modal && finalScoreEl && highScoreEl && playAgainBtn && closeBtn) {
      finalScoreEl.textContent = score.toString();
      highScoreEl.textContent = highScore.toString();
      modal.classList.remove('hidden');

      // Setup event listeners
      const handleRestart = () => {
        modal.classList.add('hidden');
        this.restart();
      };

      playAgainBtn.onclick = handleRestart;
      closeBtn.onclick = handleRestart;
    }
  }

  /**
   * Schedule an auto-save with 300ms debounce
   */
  private scheduleAutoSave(): void {
    // Clear any existing timeout
    if (this.autoSaveTimeout !== null) {
      clearTimeout(this.autoSaveTimeout);
    }

    // Schedule new save
    this.autoSaveTimeout = window.setTimeout(() => {
      this.saveGame();
      this.autoSaveTimeout = null;
    }, 300);
  }

  /**
   * Save current game state to IndexedDB
   */
  private async saveGame(): Promise<void> {
    // Skip saving if storage is not available
    if (!this.storageAvailable) {
      console.log('Storage not available, skipping auto-save');
      return;
    }

    try {
      const state = {
        board: this.board.getCells().map(row =>
          row.map(cell => cell.occupied ? 1 : 0)
        ),
        score: this.scoreManager.getScore(),
        combo: this.scoreManager.getComboMultiplier(),
        availablePieces: this.pieceManager.getAvailablePieces().map(piece => ({
          shape: piece.shape,
          color: piece.color,
          id: piece.id
        })),
        timestamp: Date.now()
      };

      await this.gameStorage.saveGame(state);
      console.log('Game auto-saved');
    } catch (error) {
      console.error('Failed to auto-save game:', error);
      // If save fails, mark storage as unavailable to prevent future attempts
      this.storageAvailable = false;
    }
  }

  /**
   * Restore game state from saved data
   */
  private restoreGameState(savedGame: any): void {
    try {
      // Restore board
      const cells = savedGame.board;
      const boardCells = this.board.getCells();

      for (let r = 0; r < cells.length && r < boardCells.length; r++) {
        for (let c = 0; c < cells[r].length && c < boardCells[r].length; c++) {
          if (cells[r][c] === 1) {
            // Use the board's setter method instead of direct assignment
            this.board.placePiece([[true]], r, c, '#D84315', `restored-${r}-${c}`);
          }
        }
      }

      // Restore score
      this.scoreManager['score'] = savedGame.score;
      this.scoreManager['comboMultiplier'] = savedGame.combo;

      console.log('Game state restored: score =', savedGame.score, 'combo =', savedGame.combo);
    } catch (error) {
      console.error('Failed to restore game state:', error);
      // If restoration fails, just start fresh
    }
  }

  restart(): void {
    this.board.clear();
    this.scoreManager.reset();
    this.cascadeEngine.reset();
    this.pieceManager.reset();
    this.effects = [];
    this.animatingCascade = false;
    this.gameState = GameState.PLAYING;

    // Delete saved game when restarting
    this.gameStorage.deleteSave().catch(err =>
      console.error('Failed to delete save:', err)
    );

    this.animationLoop.start();
    this.render();
  }

  getAudioEngine(): AudioEngine {
    return this.audioEngine;
  }

  pause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      this.animationLoop.stop();
    }
  }

  resume(): void {
    if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
      this.animationLoop.start();
    }
  }

  isPaused(): boolean {
    return this.gameState === GameState.PAUSED;
  }
}
