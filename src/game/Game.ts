// Main game controller

import { GameBoard } from './GameBoard';
import { ScoreManager } from './ScoreManager';
import { CascadeEngine } from './CascadeEngine';
import { PieceFactory } from '../pieces/PieceFactory';
import { Piece } from '../pieces/Piece';
import { BoardRenderer } from '../rendering/BoardRenderer';
import { AnimationLoop } from '../rendering/AnimationLoop';
import { GameState } from '../types/GameTypes';
import { PIECE_CONFIG } from '../utils/constants';

export class Game {
  private board: GameBoard;
  private scoreManager: ScoreManager;
  private cascadeEngine: CascadeEngine;
  private pieceFactory: PieceFactory;
  private renderer: BoardRenderer;
  private animationLoop: AnimationLoop;

  private availablePieces: Piece[] = [];
  private selectedPiece: Piece | null = null;
  private gameState: GameState = GameState.LOADING;

  constructor(canvas: HTMLCanvasElement) {
    this.board = new GameBoard();
    this.scoreManager = new ScoreManager();
    this.cascadeEngine = new CascadeEngine();
    this.pieceFactory = new PieceFactory();
    this.renderer = new BoardRenderer(canvas);
    this.animationLoop = new AnimationLoop(this.update.bind(this));

    this.init();
  }

  private init(): void {
    // Generate initial pieces
    this.availablePieces = this.pieceFactory.createMultiplePieces(PIECE_CONFIG.PANEL_SIZE);

    // Setup click handler
    const canvas = this.renderer['ctx'].canvas;
    canvas.addEventListener('click', this.handleClick.bind(this));

    this.gameState = GameState.PLAYING;
    this.animationLoop.start();
  }

  private update(deltaTime: number): void {
    // Simple render for Phase 1
    this.renderer.render(this.board.getCells());

    // Update score display
    this.updateScoreDisplay();
  }

  private handleClick(event: MouseEvent): void {
    if (this.gameState !== GameState.PLAYING) return;

    const canvas = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cellSize = this.renderer.getCellSize();
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // For Phase 1: Use first available piece
    if (this.availablePieces.length > 0) {
      const piece = this.availablePieces[0];

      if (this.board.canPlacePiece(piece.shape, row, col)) {
        // Place piece
        this.board.placePiece(piece.shape, row, col, piece.color, piece.id);

        // Remove used piece and generate new one
        this.availablePieces.shift();
        this.availablePieces.push(this.pieceFactory.createRandomPiece());

        // Process cascades
        const result = this.cascadeEngine.processCascade(this.board);

        // Update score
        if (result.totalLinesCleared > 0) {
          this.scoreManager.addScore(result.totalLinesCleared, result.cascadeLevel);
        }

        // Check game over
        if (this.board.isFull()) {
          this.gameOver();
        }
      }
    }
  }

  private updateScoreDisplay(): void {
    const scoreEl = document.getElementById('score');
    const comboEl = document.getElementById('combo');

    if (scoreEl) {
      scoreEl.textContent = this.scoreManager.getScore().toString();
    }

    if (comboEl) {
      comboEl.textContent = `${this.scoreManager.getComboMultiplier().toFixed(1)}x`;
    }
  }

  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    alert(`Game Over! Final Score: ${this.scoreManager.getScore()}`);
  }

  restart(): void {
    this.board.clear();
    this.scoreManager.reset();
    this.cascadeEngine.reset();
    this.availablePieces = this.pieceFactory.createMultiplePieces(PIECE_CONFIG.PANEL_SIZE);
    this.gameState = GameState.PLAYING;
  }
}
