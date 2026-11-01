import { useEffect, useSyncExternalStore } from "react";
import { LANG_KEY, type Lang } from "@/content/constants";

const listeners = new Set<() => void>();
/** The choice when saving it failed (private mode), so it still lasts until reload. */
let unsaved: Lang | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readSaved(): Lang {
  if (unsaved) return unsaved;
  try {
    return window.localStorage.getItem(LANG_KEY) === "ku" ? "ku" : "en";
  } catch {
    return "en";
  }
}

/**
 * English on the server and during hydration, then the visitor's saved choice.
 * Client-side navigations read the choice directly, so Kurdish never flashes English.
 * Keeps `lang` and `dir` on <html> in sync.
 */
export function useLang(): [Lang, (next: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, readSaved, () => "en" as Lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ku" ? "rtl" : "ltr";
  }, [lang]);

  function choose(next: Lang) {
    try {
      window.localStorage.setItem(LANG_KEY, next);
      unsaved = null;
    } catch {
      unsaved = next;
    }
    listeners.forEach((notify) => notify());
  }

  return [lang, choose];
}
