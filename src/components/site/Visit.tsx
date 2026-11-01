import { AppointmentForm } from "./AppointmentForm";
import { display, kicker, sans, type ChapterProps } from "./type";

export function Visit({ text, lang }: ChapterProps) {
  const ku = lang === "ku";

  return (
    <section
      id="visit"
      aria-labelledby="visit-title"
      className="scroll-mt-16 border-t border-line px-6 py-20 sm:scroll-mt-20 md:px-12 md:py-28 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:px-20 xl:gap-20"
    >
      <div id="vita" className="min-w-0 scroll-mt-16 sm:scroll-mt-20">
        <h2 id="visit-title" className={`text-4xl leading-tight text-ink md:text-5xl ${display(ku)}`}>
          {text.visit}
        </h2>
        <h3 className={`mt-12 ${kicker(ku)}`}>{text.vita}</h3>
        <p className={`mt-6 max-w-xl text-lg leading-relaxed text-ink ${ku ? "font-arabic-sans" : "font-sans font-light"}`}>
          {text.vitaBody}
        </p>
        <dl className="mt-10 max-w-xl">
          {text.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 border-t border-line py-5 sm:flex-row sm:gap-8">
              <dt className={`w-36 shrink-0 ${kicker(ku)}`}>{fact.label}</dt>
              <dd className={`text-base text-ink ${sans(ku)}`}>
                {fact.href ? (
                  <a href={fact.href} className="border-b border-ink">
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-16 min-w-0 lg:mt-0">
        <h3 className={kicker(ku)}>{text.book}</h3>
        <AppointmentForm text={text} lang={lang} />
      </div>
    </section>
  );
}
