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

    // Calculate piece dimensions
    const pieceWidth = this.dragState.piece.shape[0].length * cellSize;
    const pieceHeight = this.dragState.piece.shape.length * cellSize;

    // Simple direct grid snapping (like 1010!/Block Blast)
    // Cursor is at bottom-center of piece, so calculate top-left position
    const topLeftX = mouseX - pieceWidth / 2;
    const topLeftY = mouseY - pieceHeight;

    // Convert top-left to grid position
    const gridCol = Math.round(topLeftX / cellSize);
    const gridRow = Math.round(topLeftY / cellSize);

    this.dragState.gridRow = gridRow;
    this.dragState.gridCol = gridCol;

    // Check if placement is valid
    this.dragState.isValid = board.canPlacePiece(
      this.dragState.piece.shape,
      gridRow,
      gridCol
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

  /**
   * Find the best valid grid position within 10% tolerance
   * @param centerX Center X position of the piece
   * @param centerY Center Y position of the piece
   * @param cellSize Size of each cell
   * @param board Game board to check validity
   * @param shape Piece shape
   * @returns Best valid grid position or null if none found
   */
  private findBestGridPosition(
    centerX: number,
    centerY: number,
    cellSize: number,
    board: GameBoard,
    shape: boolean[][]
  ): { row: number; col: number } | null {
    // Base grid position from center
    const baseCol = Math.floor(centerX / cellSize);
    const baseRow = Math.floor(centerY / cellSize);

    // Calculate offset within the cell (0 to cellSize)
    const offsetX = centerX - baseCol * cellSize;
    const offsetY = centerY - baseRow * cellSize;

    // 10% tolerance
    const tolerance = cellSize * 0.10;

    // Candidate positions to check with their distances from piece center
    const candidates: Array<{ row: number; col: number; distance: number }> = [];

    // Helper function to calculate distance from a grid cell center to piece center
    const getDistanceFromCellCenter = (row: number, col: number): number => {
      const cellCenterX = col * cellSize + cellSize / 2;
      const cellCenterY = row * cellSize + cellSize / 2;
      return Math.sqrt(
        Math.pow(centerX - cellCenterX, 2) + Math.pow(centerY - cellCenterY, 2)
      );
    };

    // Always check base position
    candidates.push({
      row: baseRow,
      col: baseCol,
      distance: getDistanceFromCellCenter(baseRow, baseCol),
    });

    // Check adjacent cells if within tolerance
    // Left
    if (offsetX < tolerance) {
      candidates.push({
        row: baseRow,
        col: baseCol - 1,
        distance: getDistanceFromCellCenter(baseRow, baseCol - 1),
      });
    }

    // Right
    if (offsetX > cellSize - tolerance) {
      candidates.push({
        row: baseRow,
        col: baseCol + 1,
        distance: getDistanceFromCellCenter(baseRow, baseCol + 1),
      });
    }

    // Top
    if (offsetY < tolerance) {
      candidates.push({
        row: baseRow - 1,
        col: baseCol,
        distance: getDistanceFromCellCenter(baseRow - 1, baseCol),
      });
    }

    // Bottom
    if (offsetY > cellSize - tolerance) {
      candidates.push({
        row: baseRow + 1,
        col: baseCol,
        distance: getDistanceFromCellCenter(baseRow + 1, baseCol),
      });
    }

    // Diagonal cells if within tolerance on both axes
    if (offsetX < tolerance && offsetY < tolerance) {
      candidates.push({
        row: baseRow - 1,
        col: baseCol - 1,
        distance: getDistanceFromCellCenter(baseRow - 1, baseCol - 1),
      });
    }

    if (offsetX > cellSize - tolerance && offsetY < tolerance) {
      candidates.push({
        row: baseRow - 1,
        col: baseCol + 1,
        distance: getDistanceFromCellCenter(baseRow - 1, baseCol + 1),
      });
    }

    if (offsetX < tolerance && offsetY > cellSize - tolerance) {
      candidates.push({
        row: baseRow + 1,
        col: baseCol - 1,
        distance: getDistanceFromCellCenter(baseRow + 1, baseCol - 1),
      });
    }

    if (offsetX > cellSize - tolerance && offsetY > cellSize - tolerance) {
      candidates.push({
        row: baseRow + 1,
        col: baseCol + 1,
        distance: getDistanceFromCellCenter(baseRow + 1, baseCol + 1),
      });
    }

    // Sort candidates by distance (closest first)
    candidates.sort((a, b) => a.distance - b.distance);

    // Find first valid candidate
    for (const candidate of candidates) {
      if (board.canPlacePiece(shape, candidate.row, candidate.col)) {
        return { row: candidate.row, col: candidate.col };
      }
    }

    // No valid position found
    return null;
  }
}
