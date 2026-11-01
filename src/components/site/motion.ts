export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Eased 0→1 as `value` moves from `start` to `end`. */
export function ramp(value: number, start: number, end: number) {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

/** Scrolls the window so `track` sits at `progress` (0–1), the inverse of useScrollProgress. */
export function scrollToProgress(track: HTMLElement, progress: number) {
  const rect = track.getBoundingClientRect();
  const range = rect.height - window.innerHeight;
  window.scrollTo({ top: window.scrollY + rect.top + progress * range });
}
