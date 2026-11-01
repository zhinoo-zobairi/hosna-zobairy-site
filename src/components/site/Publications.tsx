import { useEffect, useRef, useState } from "react";
import type { Paper } from "@/content/schema";
import { kicker, type ChapterProps } from "./type";

/**
 * Not pinned. With motion on, the rows fade up the first time the list scrolls into view.
 * A list already in view when motion turns on stays as it is, so nothing blinks.
 */
export function Publications({ text, lang, motion, papers }: ChapterProps & { papers: Paper[] }) {
  const ku = lang === "ku";
  const listRef = useRef<HTMLOListElement>(null);
  const [reveal, setReveal] = useState<"idle" | "waiting" | "shown">("idle");

  useEffect(() => {
    const list = listRef.current;
    if (!motion || !list) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReveal("shown");
          observer.disconnect();
        } else {
          setReveal((current) => (current === "idle" ? "waiting" : current));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, [motion]);

  const hidden = motion && reveal === "waiting";

  return (
    <section
      aria-label={text.publications}
      className="border-t border-line px-6 py-20 md:px-12 md:py-28 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:px-20 xl:gap-20"
    >
      <h2 className={kicker(ku)}>{text.publications}</h2>
      <ol ref={listRef} className="mt-6 max-w-3xl lg:mt-0">
        {papers.map((paper, index) => (
          <li
            key={paper.title}
            className="flex min-w-0 gap-4 border-t border-line py-5 transition-[opacity,transform] duration-700 ease-out sm:gap-8"
            style={{
              opacity: hidden ? 0 : 1,
              transform: hidden ? "translate3d(0, 12px, 0)" : "none",
              transitionDelay: hidden ? "0ms" : `${index * 70}ms`,
            }}
          >
            <span className="w-12 shrink-0 pt-1 font-sans text-xs font-medium text-muted tabular-nums">
              {paper.year}
            </span>
            <div className="min-w-0">
              {paper.href ? (
                <a
                  href={paper.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-base leading-relaxed break-words text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                >
                  {paper.title}
                </a>
              ) : (
                <p className="font-sans text-base leading-relaxed break-words text-ink">{paper.title}</p>
              )}
              <p className="mt-1 font-sans text-sm text-muted">{paper.venue}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
