import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LANGS, type Lang } from "@/content/constants";
import type { Copy } from "@/content/schema";

export function LanguageMenu({
  text,
  lang,
  onChange,
}: {
  text: Copy;
  lang: Lang;
  onChange: (next: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-1 text-xs font-medium tracking-wide text-ink"
      >
        {lang === "en" ? "EN" : "KU"}
        <ChevronDown
          className={`size-3.5 motion-safe:transition-transform motion-safe:duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Language"
          className="absolute end-0 top-full z-20 mt-1 min-w-40 border border-ink bg-paper py-1"
        >
          {LANGS.map((code) => (
            <li key={code} role="option" aria-selected={lang === code}>
              <button
                type="button"
                className={`flex min-h-11 w-full items-center px-4 text-start text-sm text-ink hover:bg-line ${
                  code === "ku" ? "font-arabic-sans" : ""
                } ${lang === code ? "font-medium" : ""}`}
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                }}
              >
                {code === "en" ? text.menuEn : text.menuKu}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
