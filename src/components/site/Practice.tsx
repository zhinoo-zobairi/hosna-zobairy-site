import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { Lang } from "@/content/constants";
import type { Copy } from "@/content/schema";
import { stills } from "@/content/stills";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { clamp01, ramp, scrollToProgress } from "./motion";
import { display, kicker, sans, type ChapterProps } from "./type";

/** Scroll distance per step, in svh. */
const STEP = 80;
/** Half the width of a crossfade, in steps. */
const EDGE = 0.12;

const titleLink =
  "underline decoration-transparent decoration-1 underline-offset-[0.2em] transition-colors duration-200 hover:decoration-current";

export function Practice({ text, lang, motion }: ChapterProps) {
  return (
    <section id="practice" aria-label={text.practice} className="scroll-mt-20 border-t border-line">
      {motion ? <PracticePinned text={text} lang={lang} /> : <PracticeStacked text={text} lang={lang} />}
    </section>
  );
}

function PracticeStacked({ text, lang }: { text: Copy; lang: Lang }) {
  const ku = lang === "ku";
  return (
    <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20">
      <h2 className={kicker(ku)}>{text.practice}</h2>
      <ol className="mt-10 max-w-5xl border-b border-line">
        {text.items.map((item, index) => (
          <li
            key={item.slug}
            className="grid gap-5 border-t border-line py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10 md:py-10"
          >
            <figure className="relative aspect-3/2 overflow-hidden bg-photo">
              <img
                src={stills[index].src}
                alt={stills[index].alt[lang]}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </figure>
            <div className="min-w-0">
              <p className="font-sans text-xs font-medium text-muted tabular-nums">{item.n}</p>
              <h3 className={`mt-2 text-2xl leading-tight break-words text-ink md:text-3xl ${display(ku)}`}>
                <Link to="/practice/$slug" params={{ slug: item.slug }} className={titleLink}>
                  {item.title}
                </Link>
              </h3>
              <p className={`mt-3 max-w-xl text-base leading-relaxed break-words text-muted ${sans(ku)}`}>
                {item.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One framed still and one text block, both in a fixed spot. Each step crossfades in place;
 * the still zooms out slowly while it is shown.
 */
function PracticePinned({ text, lang }: { text: Copy; lang: Lang }) {
  const ku = lang === "ku";
  const track = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(track);
  const items = text.items;
  const count = items.length;
  const position = progress * count;
  const active = Math.min(count - 1, Math.floor(position));

  // Text: the outgoing block fades out before the incoming one fades in, so two never overlap.
  const textShown = (index: number) => {
    const offset = position - (index + 0.5);
    if ((index === 0 && offset < 0) || (index === count - 1 && offset > 0)) return 1;
    return ramp(0.5 - Math.abs(offset), 0, EDGE);
  };
  // Stills: each one fades in over the one below it and stays, so the crossfade never dips.
  const stillShown = (index: number) => (index === 0 ? 1 : ramp(position - index, -EDGE, EDGE));

  // Keyboard: focusing a title scrolls its step into place, so the focus ring is never on a hidden step.
  const focusStep = (index: number) => {
    if (track.current && index !== active) scrollToProgress(track.current, (index + 0.5) / count);
  };

  return (
    <div ref={track} className="relative" style={{ height: `calc(100svh + ${count * STEP}svh)` }}>
      <div className="sticky top-stage grid h-stage grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-12 px-20 xl:gap-20">
        <div className="min-w-0">
          <h2 className={kicker(ku)}>{text.practice}</h2>
          <div className="mt-8 flex items-center gap-4">
            <span dir="ltr" className="font-sans text-xs font-medium text-ink tabular-nums">
              {items[active].n} / {items[count - 1].n}
            </span>
            <span className="relative h-px w-24 overflow-hidden bg-line" aria-hidden>
              <span
                className={`absolute inset-0 bg-ink ${ku ? "origin-right" : "origin-left"}`}
                style={{ transform: `scaleX(${progress.toFixed(4)})` }}
              />
            </span>
          </div>
          <div className="relative mt-10 h-80">
            {items.map((item, index) => {
              const opacity = textShown(index);
              const drift = (1 - opacity) * (position < index + 0.5 ? 12 : -12);
              return (
                <div
                  key={item.slug}
                  className="absolute inset-x-0 top-0"
                  style={{
                    opacity,
                    transform: `translate3d(0, ${drift.toFixed(2)}px, 0)`,
                    pointerEvents: index === active ? "auto" : "none",
                  }}
                >
                  <h3 className={`text-4xl leading-tight text-ink xl:text-5xl ${display(ku)}`}>
                    <Link
                      to="/practice/$slug"
                      params={{ slug: item.slug }}
                      className={titleLink}
                      onFocus={() => focusStep(index)}
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className={`mt-5 max-w-md text-base leading-relaxed text-muted ${sans(ku)}`}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <figure className="relative aspect-3/2 w-full overflow-hidden bg-photo">
          {stills.map((still, index) => {
            const zoom = 1.06 - 0.06 * clamp01((position - index + EDGE) / (1 + 2 * EDGE));
            return (
              <img
                key={still.src}
                src={still.src}
                alt={still.alt[lang]}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover will-change-transform"
                style={{ opacity: stillShown(index), transform: `scale(${zoom.toFixed(4)})` }}
              />
            );
          })}
        </figure>
      </div>
    </div>
  );
}
