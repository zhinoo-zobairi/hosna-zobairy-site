import { useEffect, useState } from "react";
import { LANG_KEY, type Lang } from "@/content/constants";

/** English on the server, then the visitor's saved choice. Keeps `lang` and `dir` on <html> in sync. */
export function useLang(): [Lang, (next: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "ku") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ku" ? "rtl" : "ltr";
  }, [lang]);

  function choose(next: Lang) {
    setLang(next);
    window.localStorage.setItem(LANG_KEY, next);
  }

  return [lang, choose];
}
