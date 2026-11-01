import { useRef, type CSSProperties } from "react";
import type { Copy } from "@/content/schema";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { clamp01, ramp } from "./motion";
import { kicker, sans, type ChapterProps } from "./type";

export function Training({ text, lang, motion }: ChapterProps) {
  const ku = lang === "ku";
  if (motion) return <TrainingPinned text={text} ku={ku} />;

  return (
    <section aria-label={text.observership} className="border-t border-line px-6 py-20 md:px-12 md:py-28 lg:px-20">
      <h2 className={kicker(ku)}>{text.observership}</h2>
      <ol className="mt-6 max-w-3xl">
        {text.observerships.map((row, index) => (
          <Row key={index} year={row.year} place={row.place} ku={ku} />
        ))}
      </ol>
    </section>
  );
}

function Row({ year, place, ku, style }: { year: string; place: string; ku: boolean; style?: CSSProperties }) {
  return (
    <li className="flex min-w-0 items-baseline gap-6 border-t border-line py-5 sm:gap-10" style={style}>
      <span className="w-14 shrink-0 font-display text-2xl text-ink tabular-nums">{year}</span>
      <p className={`min-w-0 text-base leading-relaxed break-words text-ink md:text-lg ${sans(ku)}`}>{place}</p>
    </li>
  );
}

/** A line draws down the start edge of the list; each row comes up as the line reaches it. */
function TrainingPinned({ text, ku }: { text: Copy; ku: boolean }) {
  const track = useRef<HTMLElement>(null);
  const progress = useScrollProgress(track);
  const rows = text.observerships;
  const line = clamp01((progress - 0.05) / 0.75);

  return (
    <section
      ref={track}
      aria-label={text.observership}
      className="relative border-t border-line"
      style={{ height: "170svh" }}
    >
      <div className="sticky top-stage grid h-stage grid-cols-[minmax(0,5fr)_minmax(0,7fr)] content-center gap-12 px-20 xl:gap-20">
        <h2 className={kicker(ku)}>{text.observership}</h2>
        <ol className="relative ps-10">
          <span aria-hidden className="absolute inset-y-0 start-0 w-px bg-line" />
          <span
            aria-hidden
            className="absolute inset-y-0 start-0 w-px origin-top bg-ink"
            style={{ transform: `scaleY(${line.toFixed(4)})` }}
          />
          {rows.map((row, index) => {
            const reached = ramp(line * rows.length - index, 0, 0.5);
            return (
              <Row
                key={index}
                year={row.year}
                place={row.place}
                ku={ku}
                style={{
                  opacity: 0.15 + 0.85 * reached,
                  transform: `translate3d(0, ${((1 - reached) * 10).toFixed(2)}px, 0)`,
                }}
              />
            );
          })}
        </ol>
      </div>
    </section>
  );
}
