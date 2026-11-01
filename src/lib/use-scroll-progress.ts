import { useEffect, useState, type RefObject } from "react";

/**
 * 0–1 progress of the viewport through a tall track element: 0 while the track's top is at or
 * below the viewport top, 1 once its bottom reaches the viewport bottom.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const track = ref.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      setProgress(range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref]);

  return progress;
}
