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
  isTouch: boolean; // Whether this drag was initiated by touch
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
    isTouch: false,
  };

  startDrag(piece: Piece, mouseX: number, mouseY: number, isTouch: boolean = false): void {
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
      isTouch,
    };
  }

  updateDrag(mouseX: number, mouseY: number, board: GameBoard, cellSize: number): void {
    if (!this.dragState.isDragging || !this.dragState.piece) return;

    this.dragState.currentX = mouseX;
    this.dragState.currentY = mouseY;

    let adjustedX = mouseX;
    let adjustedY = mouseY;

    if (this.dragState.piece) {
      const pieceWidth = this.dragState.piece.shape[0].length * cellSize;
      const pieceHeight = this.dragState.piece.shape.length * cellSize;
      adjustedX = mouseX - pieceWidth * 0.5;
      adjustedY = mouseY - pieceHeight * 0.5;
    }

    // Convert to grid coordinates (use adjusted position for touch)
    const gridPos = this.screenToGrid(adjustedX, adjustedY, cellSize);
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
      isTouch: false,
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
