// Drag-and-drop logic for pieces

import type { Piece } from '../pieces/Piece';
import type { GameBoard } from '../game/GameBoard';

export interface DragState {
  piece: Piece | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  isValid: boolean;
  gridRow: number;
  gridCol: number;
}

export class DragHandler {
  private dragState: DragState = {
    piece: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    isValid: false,
    gridRow: 0,
    gridCol: 0,
  };

  startDrag(piece: Piece, mouseX: number, mouseY: number): void {
    this.dragState = {
      piece,
      startX: mouseX,
      startY: mouseY,
      currentX: mouseX,
      currentY: mouseY,
      isDragging: true,
      isValid: false,
      gridRow: 0,
      gridCol: 0,
    };
  }

  updateDrag(mouseX: number, mouseY: number, board: GameBoard, cellSize: number): void {
    if (!this.dragState.isDragging || !this.dragState.piece) return;

    this.dragState.currentX = mouseX;
    this.dragState.currentY = mouseY;

    // Convert to grid coordinates
    const gridPos = this.screenToGrid(mouseX, mouseY, cellSize);
    this.dragState.gridRow = gridPos.row;
    this.dragState.gridCol = gridPos.col;

    // Check if placement is valid
    this.dragState.isValid = board.canPlacePiece(
      this.dragState.piece.shape,
      gridPos.row,
      gridPos.col
    );
  }

  endDrag(): { piece: Piece; row: number; col: number } | null {
    if (!this.dragState.isDragging || !this.dragState.piece || !this.dragState.isValid) {
      this.cancelDrag();
      return null;
    }

    const result = {
      piece: this.dragState.piece,
      row: this.dragState.gridRow,
      col: this.dragState.gridCol,
    };

    this.cancelDrag();
    return result;
  }

  cancelDrag(): void {
    this.dragState = {
      piece: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      isValid: false,
      gridRow: 0,
      gridCol: 0,
    };
  }

  getDragState(): DragState {
    return { ...this.dragState };
  }

  isDragging(): boolean {
    return this.dragState.isDragging;
  }

  private screenToGrid(x: number, y: number, cellSize: number): { row: number; col: number } {
    return {
      row: Math.floor(y / cellSize),
      col: Math.floor(x / cellSize),
    };
  }
}
