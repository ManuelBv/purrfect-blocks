// Manages spark particles for line clear effects

import type { Particle } from '../types/RenderTypes';

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number;
  private particlesPerBlock: number;

  constructor(isMobile: boolean = false) {
    // Optimize for mobile: fewer particles
    this.maxParticles = isMobile ? 50 : 100;
    this.particlesPerBlock = isMobile ? 2 : 4;
  }

  /**
   * Spawn spark particles at a block position
   */
  spawnParticles(x: number, y: number, cellSize: number, color: string): void {
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;

    for (let i = 0; i < this.particlesPerBlock; i++) {
      // Don't exceed max particles (performance optimization)
      if (this.particles.length >= this.maxParticles) {
        break;
      }

      // Random angle for spark direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100; // pixels per second

      const particle: Particle = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 300 + Math.random() * 200, // 300-500ms lifetime
        color: this.randomizeColor(color),
        size: 2 + Math.random() * 2, // 2-4 pixels
        birthTime: Date.now()
      };

      this.particles.push(particle);
    }
  }

  /**
   * Update all particles (physics and lifetime)
   */
  update(deltaTime: number): void {
    const currentTime = Date.now();

    // Update existing particles
    this.particles = this.particles.filter(particle => {
      const age = currentTime - particle.birthTime;

      // Remove dead particles
      if (age >= particle.maxLife) {
        return false;
      }

      // Update lifetime (0-1)
      particle.life = 1 - (age / particle.maxLife);

      // Update position based on velocity
      const dt = deltaTime / 1000; // convert to seconds
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Simple gravity effect
      particle.vy += 200 * dt; // pixels/sec^2

      // Air resistance
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      return true;
    });
  }

  /**
   * Get all active particles for rendering
   */
  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Add slight color variation to particles for visual interest
   */
  private randomizeColor(baseColor: string): string {
    // For spark effect, add some warm colors
    const sparkColors = [
      '#FFD700', // Gold
      '#FFA500', // Orange
      '#FFFF00', // Yellow
      '#FFE4B5', // Moccasin
      '#FFDAB9', // Peach
    ];

    // 70% chance to use spark color, 30% use block color
    return Math.random() < 0.7 ? sparkColors[Math.floor(Math.random() * sparkColors.length)] : baseColor;
  }

  /**
   * Get current particle count (for debugging/monitoring)
   */
  getParticleCount(): number {
    return this.particles.length;
  }
}
