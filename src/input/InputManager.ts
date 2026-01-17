// Input event coordinator

import { DragHandler } from './DragHandler';
import type { Piece } from '../pieces/Piece';
import type { GameBoard } from '../game/GameBoard';

export class InputManager {
  private dragHandler: DragHandler;
  private cellSize: number;
  private boardCanvas: HTMLCanvasElement;
  private panelCanvas: HTMLCanvasElement | null = null;

  private onPiecePlaced: ((piece: Piece, row: number, col: number) => void) | null = null;
  private onPieceSelected: ((index: number) => void) | null = null;

  constructor(boardCanvas: HTMLCanvasElement, cellSize: number) {
    this.boardCanvas = boardCanvas;
    this.cellSize = cellSize;
    this.dragHandler = new DragHandler();

    this.setupEventListeners();
  }

  setPanelCanvas(canvas: HTMLCanvasElement): void {
    this.panelCanvas = canvas;
  }

  setCallbacks(
    onPiecePlaced: (piece: Piece, row: number, col: number) => void,
    onPieceSelected: (index: number) => void
  ): void {
    this.onPiecePlaced = onPiecePlaced;
    this.onPieceSelected = onPieceSelected;
  }

  private setupEventListeners(): void {
    // Board canvas events
    this.boardCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.boardCanvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Global mouse events for drag tracking (works even when cursor leaves canvas)
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Touch events for mobile
    this.boardCanvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.boardCanvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.boardCanvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  startDragFromPanel(piece: Piece, event: MouseEvent, isTouch: boolean = false): void {
    const rect = this.boardCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.dragHandler.startDrag(piece, x, y, isTouch);
  }

  updateDrag(board: GameBoard): void {
    // Called during animation loop to update drag state
  }

  private handleMouseDown(event: MouseEvent): void {
    // For Phase 2, drag starts from panel (handled separately)
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.dragHandler.isDragging()) return;

    const rect = this.boardCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Store coordinates, board validation will happen in Game controller
    this.dragHandler['dragState'].currentX = x;
    this.dragHandler['dragState'].currentY = y;
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.dragHandler.isDragging()) return;

    const result = this.dragHandler.endDrag();

    if (result && this.onPiecePlaced) {
      this.onPiecePlaced(result.piece, result.row, result.col);
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length === 0) return;

    const touch = event.touches[0];
    const rect = this.boardCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Trigger haptic feedback if available
    this.triggerHaptic('light');

    // Store touch coordinates (will be handled by drag from panel)
    this.dragHandler['dragState'].currentX = x;
    this.dragHandler['dragState'].currentY = y;
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    if (!this.dragHandler.isDragging() || event.touches.length === 0) return;

    const touch = event.touches[0];
    const rect = this.boardCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Update drag coordinates
    this.dragHandler['dragState'].currentX = x;
    this.dragHandler['dragState'].currentY = y;
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.dragHandler.isDragging()) return;

    // Trigger haptic feedback if available
    this.triggerHaptic('medium');

    const result = this.dragHandler.endDrag();

    if (result && this.onPiecePlaced) {
      this.onPiecePlaced(result.piece, result.row, result.col);
    }
  }

  private triggerHaptic(intensity: 'light' | 'medium' | 'heavy'): void {
    // Trigger haptic feedback on supported devices
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[intensity]);
    }
  }

  getDragHandler(): DragHandler {
    return this.dragHandler;
  }

  updateCellSize(cellSize: number): void {
    this.cellSize = cellSize;
  }
}
