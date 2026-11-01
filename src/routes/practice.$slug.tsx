import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PHONE, PROCEDURE_SLUGS, type ProcedureSlug } from "@/content/constants";
import { stills } from "@/content/stills";
import { getSiteContent } from "@/server/content";
import { Header } from "@/components/site/Header";
import { useLang } from "@/components/site/use-lang";
import { display, sans } from "@/components/site/type";

export const Route = createFileRoute("/practice/$slug")({
  loader: async ({ params }) => {
    const index = PROCEDURE_SLUGS.indexOf(params.slug as ProcedureSlug);
    if (index < 0) throw notFound();
    const content = await getSiteContent();
    return { index, content };
  },
  headers: () => ({ "Cache-Control": "public, s-maxage=60" }),
  component: ProcedurePage,
});

function ProcedurePage() {
  const { index, content } = Route.useLoaderData();
  const [lang, setLang] = useLang();
  const text = content[lang];
  const ku = lang === "ku";
  const item = text.items[index];
  const still = stills[index];

  return (
    <div dir={ku ? "rtl" : "ltr"} className="bg-paper text-ink">
      <Header text={text} lang={lang} onLang={setLang} base="/" />

      <article className="px-6 py-12 md:px-12 md:py-16 lg:px-20">
        <Link to="/" hash="practice" className={`text-sm text-muted ${sans(ku)}`}>
          {text.practice}
        </Link>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <figure className="relative aspect-4/3 overflow-hidden rounded-2xl bg-photo">
            <img
              src={still.src}
              alt={still.alt[lang]}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </figure>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="font-sans text-xs font-medium text-ink tabular-nums">{item.n}</span>
              <span className="h-px w-8 bg-ink" />
            </div>
            <h1 className={`text-3xl leading-tight break-words text-ink sm:text-4xl md:text-5xl ${display(ku)}`}>
              {item.title}
            </h1>
            <p className={`max-w-xl text-lg leading-relaxed text-muted ${sans(ku)}`}>{item.text}</p>
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
