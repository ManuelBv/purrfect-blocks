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
import { GameState } from '../types/GameTypes';
import type { VisualEffect } from '../types/RenderTypes';
import type { Piece } from '../pieces/Piece';

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

    // Setup effects canvas to cover entire game area
    this.setupEffectsCanvas(effectsCanvas);

    // Setup input
    this.inputManager = new InputManager(boardCanvas, cellSize);
    this.inputManager.setPanelCanvas(panelCanvas);
    this.inputManager.setCallbacks(
      this.handlePiecePlaced.bind(this),
      this.handlePieceSelected.bind(this)
    );

    // Setup panel click handler
    panelCanvas.addEventListener('mousedown', this.handlePanelClick.bind(this));

    this.animationLoop = new AnimationLoop(this.update.bind(this));

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

  private init(): void {
    this.gameState = GameState.PLAYING;
    this.animationLoop.start();
    this.render();
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
    // Render board
    this.boardRenderer.render(this.board.getCells());

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
        PieceRenderer.renderPiece(
          effectsCtx,
          dragState.piece,
          dragState.currentX + boardOffsetX - cellSize,
          dragState.currentY + boardOffsetY - cellSize,
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

  private handlePieceSelected(index: number): void {
    this.pieceManager.selectPiece(index);
  }

  private handlePiecePlaced(piece: Piece, row: number, col: number): void {
    if (this.animatingCascade) return;

    // Place piece on board
    this.board.placePiece(piece.shape, row, col, piece.color, piece.id);

    // Consume the piece from manager
    const selectedIndex = this.pieceManager.getSelectedIndex();
    if (selectedIndex >= 0) {
      this.pieceManager.consumePiece(selectedIndex);
    }

    // Process cascades with animation
    this.processCascadeWithAnimation();

    // Check game over
    if (this.board.isFull()) {
      this.gameOver();
    }
  }

  private async processCascadeWithAnimation(): Promise<void> {
    this.animatingCascade = true;

    // Add a brief delay to show the placed piece
    await this.delay(200);

    const result = this.cascadeEngine.processCascade(this.board);

    if (result.totalLinesCleared > 0) {
      const score = this.scoreManager.addScore(result.totalLinesCleared, result.cascadeLevel);

      // Show cascade message
      if (result.cascadeLevel > 1) {
        this.hudRenderer.showMessage(`${result.cascadeLevel}x CASCADE! +${score}`);
      }
    } else {
      // Reset combo if no lines cleared
      this.scoreManager.resetCombo();
    }

    this.animatingCascade = false;
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

  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    this.animationLoop.stop();

    const finalScore = this.scoreManager.getScore();
    const linesCleared = this.scoreManager.getTotalLinesCleared();

    alert(`Game Over!\n\nFinal Score: ${finalScore}\nLines Cleared: ${linesCleared}`);
  }

  restart(): void {
    this.board.clear();
    this.scoreManager.reset();
    this.cascadeEngine.reset();
    this.pieceManager.reset();
    this.effects = [];
    this.animatingCascade = false;
    this.gameState = GameState.PLAYING;
    this.animationLoop.start();
    this.render();
  }
}
