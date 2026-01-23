// Visual effects for line clears and animations

import type { VisualEffect, Particle } from '../types/RenderTypes';
import { UI_COLORS } from '../utils/Colors';

export class EffectsRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;

  constructor(canvas: HTMLCanvasElement, cellSize: number) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2d context for effects');
    }
    this.ctx = context;
    this.cellSize = cellSize;
  }

  render(effects: VisualEffect[], particles: Particle[] = []): void {
    this.clear();

    // Render visual effects
    for (const effect of effects) {
      switch (effect.type) {
        case 'CLEAR_LINE':
          this.renderClearEffect(effect);
          break;
        case 'GLOW':
          this.renderGlowEffect(effect);
          break;
        case 'FALL':
          this.renderFallEffect(effect);
          break;
      }
    }

    // Render particles
    this.renderParticles(particles);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private renderClearEffect(effect: VisualEffect): void {
    const { row, col } = effect.position;
    const x = col * this.cellSize;
    const y = row * this.cellSize;

    this.ctx.save();

    // Fade out effect
    this.ctx.globalAlpha = 1 - effect.progress;
    this.ctx.fillStyle = '#FFD700'; // Gold color
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

    // Particle burst effect
    if (effect.progress < 0.5) {
      this.ctx.globalAlpha = 0.8;
      this.ctx.strokeStyle = effect.color;
      this.ctx.lineWidth = 3;
      const size = this.cellSize * (1 + effect.progress * 2);
      const offset = (size - this.cellSize) / 2;
      this.ctx.strokeRect(x - offset, y - offset, size, size);
    }

    this.ctx.restore();
  }

  private renderGlowEffect(effect: VisualEffect): void {
    const { row, col } = effect.position;
    const x = col * this.cellSize + this.cellSize / 2;
    const y = row * this.cellSize + this.cellSize / 2;

    this.ctx.save();

    // Pulsing glow
    const alpha = 0.5 + Math.sin(effect.progress * Math.PI * 4) * 0.3;
    this.ctx.globalAlpha = alpha;

    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = effect.color;
    this.ctx.fillStyle = effect.color;

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private renderFallEffect(effect: VisualEffect): void {
    // Subtle trail effect for falling blocks
    const { row, col } = effect.position;
    const x = col * this.cellSize;
    const y = row * this.cellSize;

    this.ctx.save();
    this.ctx.globalAlpha = 0.3 * (1 - effect.progress);
    this.ctx.fillStyle = effect.color;
    this.ctx.fillRect(x, y - this.cellSize * effect.progress, this.cellSize, this.cellSize * effect.progress);
    this.ctx.restore();
  }

  private renderParticles(particles: Particle[]): void {
    this.ctx.save();

    for (const particle of particles) {
      // Fade out as particle dies
      this.ctx.globalAlpha = particle.life;

      // Draw spark particle
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Add slight glow for spark effect
      if (particle.life > 0.5) {
        this.ctx.globalAlpha = particle.life * 0.5;
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }

    this.ctx.restore();
  }

  updateSize(cellSize: number): void {
    this.cellSize = cellSize;
  }
}
