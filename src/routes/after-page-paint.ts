/** Let the destination frame paint before mounting its heavier content. */
export function afterPagePaint(): Promise<void> {
  if (document.hidden) return Promise.resolve();
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
}
