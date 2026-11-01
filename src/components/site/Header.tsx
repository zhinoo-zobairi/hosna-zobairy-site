import { Link } from "@tanstack/react-router";
import { INSTAGRAM, type Lang } from "@/content/constants";
import type { Copy } from "@/content/schema";
import { LanguageMenu } from "./LanguageMenu";
import { display } from "./type";

/** `base` prefixes the in-page anchors: "" on the home page, "/" elsewhere. */
export function Header({
  text,
  lang,
  onLang,
  base = "",
}: {
  text: Copy;
  lang: Lang;
  onLang: (next: Lang) => void;
  base?: string;
}) {
  const ku = lang === "ku";
  const navLink = `text-sm text-muted transition-colors duration-200 hover:text-ink ${ku ? "font-arabic-sans" : ""}`;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 md:px-10">
      <Link to="/" className={`min-w-0 text-lg tracking-tight text-ink sm:text-xl ${display(ku)}`}>
        {text.mark}
      </Link>
      <nav className="flex shrink-0 items-center gap-2 sm:gap-6" aria-label="Primary">
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className={`hidden sm:inline ${navLink}`}>
          {text.instagram}
        </a>
        <a href={`${base}#vita`} className={`hidden md:inline ${navLink}`}>
          {text.vita}
        </a>
        <LanguageMenu text={text} lang={lang} onChange={onLang} />
        <a
          href={`${base}#visit`}
          className={`inline-flex min-h-11 items-center border border-ink px-3 text-[11px] font-medium text-ink sm:px-5 sm:text-xs ${
            ku ? "font-arabic-sans" : "tracking-wide sm:uppercase sm:tracking-kicker"
          }`}
        >
          {text.book}
        </a>
      </nav>
    </header>
  );
}
