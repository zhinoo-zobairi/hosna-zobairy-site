import { Fragment, useRef } from "react";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { clamp01 } from "./motion";
import { display, type ChapterProps } from "./type";

/** Opacity of a word not yet reached: ink this faint reads as muted on paper. */
const UNLIT = 0.28;

export function Statement({ text, lang, motion }: ChapterProps) {
  const ku = lang === "ku";
  const type = `text-3xl leading-snug text-ink md:text-4xl lg:text-5xl lg:leading-tight ${display(ku)}`;

  if (motion) return <StatementPinned statement={text.statement} type={type} />;

  return (
    <section className="border-t border-line px-6 py-20 md:px-12 md:py-28 lg:px-20">
      <p className={`max-w-4xl ${type}`}>{text.statement}</p>
    </section>
  );
}

/** Words turn from muted to ink in reading order as the track scrolls past. */
function StatementPinned({ statement, type }: { statement: string; type: string }) {
  const track = useRef<HTMLElement>(null);
  const progress = useScrollProgress(track);
  const words = statement.split(/\s+/).filter(Boolean);
  const lit = clamp01((progress - 0.1) / 0.7) * words.length;

  return (
    <section ref={track} className="relative border-t border-line" style={{ height: "200svh" }}>
      <div className="sticky top-stage flex h-stage items-center px-20">
        <p className={`max-w-5xl ${type}`}>
          {words.map((word, index) => (
            <Fragment key={index}>
              <span style={{ opacity: UNLIT + (1 - UNLIT) * clamp01(lit - index) }}>{word}</span>{" "}
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
