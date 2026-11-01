import { useRef, type CSSProperties } from "react";
import type { Copy } from "@/content/schema";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { ramp, scrollToProgress } from "./motion";
import { display, kicker, sans, type ChapterProps } from "./type";

const PORTRAIT = "/portrait.png";

export function Hero({ text, lang, motion }: ChapterProps) {
  const ku = lang === "ku";
  return motion ? <HeroPinned text={text} ku={ku} /> : <HeroStatic text={text} ku={ku} />;
}

function HeroText({
  text,
  ku,
  style,
  onFocus,
}: {
  text: Copy;
  ku: boolean;
  style?: CSSProperties;
  onFocus?: () => void;
}) {
  return (
    <div
      className="flex flex-col justify-end gap-6 px-6 py-12 md:justify-center md:px-12 md:py-16 lg:px-20"
      style={style}
      onFocus={onFocus}
    >
      <p className={kicker(ku)}>{text.place}</p>
      <h1 className={`text-4xl leading-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl ${display(ku)}`}>
        {text.name}
      </h1>
      <p className={`max-w-sm text-lg font-light leading-relaxed text-ink ${sans(ku)}`}>{text.line}</p>
      <p className={`text-sm text-muted ${sans(ku)}`}>{text.cred}</p>
      <a
        href="#visit"
        className={`mt-2 inline-flex min-h-11 w-fit items-center border-b border-ink text-sm text-ink ${sans(ku)}`}
      >
        {text.book}
      </a>
    </div>
  );
}

function Portrait({ alt }: { alt: string }) {
  return (
    <img
      src={PORTRAIT}
      alt={alt}
      fetchPriority="high"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
}

function HeroStatic({ text, ku }: { text: Copy; ku: boolean }) {
  return (
    <section className="grid min-h-hero md:grid-cols-2">
      <HeroText text={text} ku={ku} />
      <figure className="relative aspect-3/4 bg-photo md:aspect-auto md:min-h-full">
        <Portrait alt={text.name} />
      </figure>
    </section>
  );
}

/**
 * The portrait frame sits where the split hero has it (the end half). At progress 0 it is scaled
 * 2× and shifted to the stage centre, so it fills the stage; it shrinks back into place as you
 * scroll and uncovers the text, which fades in.
 */
function HeroPinned({ text, ku }: { text: Copy; ku: boolean }) {
  const track = useRef<HTMLElement>(null);
  const progress = useScrollProgress(track);
  const shrink = ramp(progress, 0, 0.8);
  const reveal = ramp(progress, 0.45, 0.9);
  const toCentre = (ku ? 50 : -50) * (1 - shrink);

  return (
    <section ref={track} className="relative" style={{ height: "200svh" }}>
      <div className="sticky top-stage grid h-stage grid-cols-2 overflow-hidden">
        <HeroText
          text={text}
          ku={ku}
          style={{ opacity: reveal, transform: `translate3d(0, ${((1 - reveal) * 24).toFixed(2)}px, 0)` }}
          onFocus={() => {
            if (track.current && progress < 1) scrollToProgress(track.current, 1);
          }}
        />
        <figure
          className="absolute inset-y-0 end-0 z-10 w-1/2 bg-photo will-change-transform"
          style={{
            transformOrigin: "50% 30%",
            transform: `translate3d(${toCentre.toFixed(3)}%, 0, 0) scale(${(2 - shrink).toFixed(4)})`,
          }}
        >
          <Portrait alt={text.name} />
        </figure>
      </div>
    </section>
  );
}
