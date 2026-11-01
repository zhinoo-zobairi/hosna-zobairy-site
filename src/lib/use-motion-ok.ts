import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * True only on a wide screen without reduced motion. The server snapshot is false, so the server
 * render and the hydrated first paint are the stacked layout; React then switches to the live
 * value and follows changes. Client-side navigations start from the live value, so hash links
 * land on the right layout.
 */
export function useMotionOk(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
