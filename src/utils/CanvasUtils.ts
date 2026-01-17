// Canvas utility functions for shared rendering operations

/**
 * Clear canvas and fill with board background color
 */
export function clearBoardCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Cream background matching the title text
  ctx.fillStyle = '#FFF8E1';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
