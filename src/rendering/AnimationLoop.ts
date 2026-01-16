// 60fps animation loop using RequestAnimationFrame

export class AnimationLoop {
  private lastTime: number = 0;
  private animationId: number | null = null;
  private callback: (deltaTime: number) => void;
  private isRunning: boolean = false;

  constructor(callback: (deltaTime: number) => void) {
    this.callback = callback;
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.callback(deltaTime);

    this.animationId = requestAnimationFrame(this.loop);
  };

  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }
}
