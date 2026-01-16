// Base piece class

import type { PieceDefinition, PieceData } from '../types/PieceTypes';

export class Piece {
  readonly id: string;
  readonly definition: PieceDefinition;

  constructor(definition: PieceDefinition, id?: string) {
    this.id = id || this.generateId();
    this.definition = definition;
  }

  private generateId(): string {
    return `piece_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  get shape() {
    return this.definition.shape;
  }

  get color() {
    return this.definition.color;
  }

  get width() {
    return this.definition.shape[0].length;
  }

  get height() {
    return this.definition.shape.length;
  }

  toData(): PieceData {
    return {
      id: this.id,
      definition: this.definition,
    };
  }

  static fromData(data: PieceData): Piece {
    return new Piece(data.definition, data.id);
  }
}
