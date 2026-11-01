import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { INSTAGRAM, LANG_KEY, PHONE, PROCEDURE_SLUGS, type Lang } from "@/content/constants";
import { defaultContent } from "@/content/default";
import { stills } from "@/content/stills";
import { LanguageMenu } from "@/components/site/LanguageMenu";

const copy = defaultContent;

export const Route = createFileRoute("/practice/$slug")({
  loader: ({ params }) => {
    const index = PROCEDURE_SLUGS.indexOf(params.slug as (typeof PROCEDURE_SLUGS)[number]);
    if (index < 0) throw notFound();
    return { index };
  },
  component: ProcedurePage,
});

function ProcedurePage() {
  const { index } = Route.useLoaderData();
  const [lang, setLang] = useState<Lang>("en");
  const text = copy[lang];
  const ku = lang === "ku";
  const item = text.items[index];
  const still = stills[index];

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "ku") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = ku ? "ku" : "en";
    document.documentElement.dir = ku ? "rtl" : "ltr";
  }, [ku]);

  function chooseLang(next: Lang) {
    setLang(next);
    window.localStorage.setItem(LANG_KEY, next);
  }

  return (
    <div dir={ku ? "rtl" : "ltr"} className="bg-paper text-ink">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 md:px-10">
        <Link to="/" className={`min-w-0 text-lg tracking-tight text-ink sm:text-xl ${ku ? "font-arabic" : "font-display"}`}>
          {text.mark}
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-6" aria-label="Primary">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden text-sm text-muted transition-colors duration-200 hover:text-ink sm:inline ${
              ku ? "font-arabic-sans" : ""
            }`}
          >
            {text.instagram}
          </a>
          <LanguageMenu text={text} lang={lang} onChange={chooseLang} />
          <a
            href={`tel:${PHONE}`}
            className={`inline-flex min-h-11 items-center border border-ink px-3 text-[11px] font-medium text-ink sm:px-5 sm:text-xs ${
              ku ? "font-arabic-sans" : "tracking-wide sm:uppercase sm:tracking-kicker"
            }`}
          >
            {text.book}
          </a>
        </nav>
      </header>

      <article className="px-6 py-12 md:px-12 md:py-16 lg:px-20">
        <Link
          to="/"
          hash="practice"
          className={`text-sm text-muted ${ku ? "font-arabic-sans" : "font-sans"}`}
        >
          {text.practice}
        </Link>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <figure className="relative aspect-4/3 overflow-hidden rounded-2xl bg-photo">
            <img src={still.src} alt={still.alt[lang]} className="absolute inset-0 h-full w-full object-cover" />
          </figure>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="font-sans text-xs font-medium text-ink tabular-nums">{item.n}</span>
              <span className="h-px w-8 bg-ink" />
            </div>
            <h1 className={`text-3xl leading-tight break-words text-ink sm:text-4xl md:text-5xl ${ku ? "font-arabic" : "font-display"}`}>
              {item.title}
            </h1>
            <p className={`max-w-xl text-lg leading-relaxed text-muted ${ku ? "font-arabic-sans" : "font-sans"}`}>
              {item.text}
            </p>
            <a
              href={`tel:${PHONE}`}
              className={`inline-flex min-h-11 w-fit items-center border border-ink px-4 text-xs font-medium text-ink ${
                ku ? "font-arabic-sans" : "uppercase tracking-kicker"
              }`}
            >
              {text.book}
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
