// Manages staggered block clearing animations

export interface BlockClearAnimation {
  row: number;
  col: number;
  startTime: number;
  duration: number;
  color: string;
}

export class ClearAnimationManager {
  private animations: BlockClearAnimation[] = [];
  private animationDuration = 400; // ms per block (increased from 150 for visibility)
  private staggerDelay = 120; // ms delay between blocks in a line (increased from 50)

  /**
   * Schedule clearing animations for rows and columns
   * Blocks at the same position clear simultaneously
   */
  scheduleClearing(rows: number[], cols: number[], board: { getCell(r: number, c: number): any }): void {
    this.animations = [];
    const currentTime = Date.now();

    console.log('scheduleClearing called with', rows.length, 'rows and', cols.length, 'cols');

    // Create a map of all blocks to clear with their timing
    const clearMap = new Map<string, { row: number; col: number; delay: number; color: string }>();

    // Schedule row clears (left to right)
    rows.forEach(rowIndex => {
      for (let col = 0; col < 12; col++) {
        const key = `${rowIndex},${col}`;
        const cell = board.getCell(rowIndex, col);
        if (cell && cell.occupied) {
          const existingEntry = clearMap.get(key);
          const delay = col * this.staggerDelay;

          // Keep the earliest delay if this block is in multiple lines
          if (!existingEntry || delay < existingEntry.delay) {
            clearMap.set(key, {
              row: rowIndex,
              col: col,
              delay: delay,
              color: cell.color || '#8B4513'
            });
          }
        }
      }
    });

    // Schedule column clears (top to bottom)
    cols.forEach(colIndex => {
      for (let row = 0; row < 18; row++) {
        const key = `${row},${colIndex}`;
        const cell = board.getCell(row, colIndex);
        if (cell && cell.occupied) {
          const existingEntry = clearMap.get(key);
          const delay = row * this.staggerDelay;

          // Keep the earliest delay if this block is in multiple lines
          if (!existingEntry || delay < existingEntry.delay) {
            clearMap.set(key, {
              row: row,
              col: colIndex,
              delay: delay,
              color: cell.color || '#8B4513'
            });
          }
        }
      }
    });

    // Convert to animations
    clearMap.forEach(({ row, col, delay, color }) => {
      this.animations.push({
        row,
        col,
        startTime: currentTime + delay,
        duration: this.animationDuration,
        color
      });
    });

    console.log('Created', this.animations.length, 'animations');
    console.log('Animation duration per block:', this.animationDuration, 'ms');
    console.log('Stagger delay:', this.staggerDelay, 'ms');
  }

  /**
   * Get progress (0-1) for a specific block, or null if not animating
   */
  getBlockProgress(row: number, col: number): number | null {
    const anim = this.animations.find(a => a.row === row && a.col === col);
    if (!anim) return null;

    const currentTime = Date.now();
    const elapsed = currentTime - anim.startTime;

    if (elapsed < 0) return 0; // Not started yet
    if (elapsed >= anim.duration) return 1; // Complete

    return elapsed / anim.duration;
  }

  /**
   * Returns true if any animations are still active
   */
  isAnimating(): boolean {
    if (this.animations.length === 0) return false;

    const currentTime = Date.now();
    return this.animations.some(anim => currentTime < anim.startTime + anim.duration);
  }

  /**
   * Get total animation duration
   */
  getTotalDuration(): number {
    if (this.animations.length === 0) return 0;

    const maxEndTime = Math.max(...this.animations.map(a => a.startTime + a.duration));
    const minStartTime = Math.min(...this.animations.map(a => a.startTime));

    return maxEndTime - minStartTime;
  }

  /**
   * Get all active animations for rendering
   */
  getActiveAnimations(): BlockClearAnimation[] {
    const currentTime = Date.now();
    return this.animations.filter(a => {
      const elapsed = currentTime - a.startTime;
      return elapsed >= 0 && elapsed < a.duration;
    });
  }

  clear(): void {
    this.animations = [];
  }
}
