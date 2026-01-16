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

  startDragFromPanel(piece: Piece, event: MouseEvent): void {
    const rect = this.boardCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.dragHandler.startDrag(piece, x, y);
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
    // Touch support for Phase 4
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    // Touch support for Phase 4
  }

  private handleTouchEnd(event: TouchEvent): void {
    // Touch support for Phase 4
  }

  getDragHandler(): DragHandler {
    return this.dragHandler;
  }

  updateCellSize(cellSize: number): void {
    this.cellSize = cellSize;
  }
}
