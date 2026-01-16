// Individual cell state

import type { CellData } from '../types/GameTypes';

export class Cell {
  private _occupied: boolean = false;
  private _color: string | null = null;
  private _pieceId: string | null = null;

  get occupied(): boolean {
    return this._occupied;
  }

  get color(): string | null {
    return this._color;
  }

  get pieceId(): string | null {
    return this._pieceId;
  }

  fill(color: string, pieceId: string): void {
    this._occupied = true;
    this._color = color;
    this._pieceId = pieceId;
  }

  clear(): void {
    this._occupied = false;
    this._color = null;
    this._pieceId = null;
  }

  isEmpty(): boolean {
    return !this._occupied;
  }

  toData(): CellData {
    return {
      occupied: this._occupied,
      color: this._color,
      pieceId: this._pieceId,
    };
  }

  static fromData(data: CellData): Cell {
    const cell = new Cell();
    if (data.occupied && data.color && data.pieceId) {
      cell.fill(data.color, data.pieceId);
    }
    return cell;
  }
}
