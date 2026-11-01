import { useEffect, useId, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

export const PHONE = "+988733284829";
export const INSTAGRAM = "https://www.instagram.com/dr.hosnazobairy/";
export const LANG_KEY = "zobairy-lang";

const papers = [
  {
    year: "2023",
    title: "Nasopharyngeal myiasis in intensive care unit patients: report of two cases",
    venue: "Iranian Journal of Parasitology",
    href: "https://pubmed.ncbi.nlm.nih.gov/37197075/",
  },
  {
    year: "2023",
    title: "Nasopharyngeal branchial cyst and Thornwaldt cyst after coronavirus infection",
    venue: "Iranian Journal of Otorhinolaryngology",
    href: "https://pubmed.ncbi.nlm.nih.gov/38090613/",
  },
  {
    year: "2023",
    title: "Tonsillar lymphangiomatous polyps: a rare case report",
    venue: "Journal of Otorhinolaryngology and Facial Plastic Surgery",
  },
  {
    year: "2022",
    title:
      "Diabetes mellitus and other underlying conditions in COVID-19-associated rhino-orbito-cerebral mucormycosis: a systematic review and meta-analysis",
    venue: "Journal of Laryngology & Otology",
    href: "https://pubmed.ncbi.nlm.nih.gov/35514092/",
  },
  {
    year: "2020",
    title: "Alloderm graft for repairing nasoseptal perforation",
    venue: "Shiraz E-Medical Journal",
  },
  {
    year: "2020",
    title:
      "Association of olfactory dysfunction with hospitalization for COVID-19: a multicenter study in Kurdistan",
    venue: "medRxiv",
    href: "https://www.medrxiv.org/content/10.1101/2020.07.26.20158550",
  },
  {
    year: "2015",
    title: "Fraser syndrome with laryngeal webs: two cases and a review",
    venue: "International Journal of Pediatric Otorhinolaryngology",
    href: "https://pubmed.ncbi.nlm.nih.gov/26384833/",
  },
] as const;

export const stills = [
  {
    src: "/practice/nose.jpg",
    alt: { en: "A profile in warm window light", ku: "پڕۆفایلێک لە ڕووناکیی پەنجەرە" },
  },
  {
    src: "/practice/sinus.jpg",
    alt: { en: "Closed eyes, light across the brow", ku: "چاوی داخراو، ڕووناکی لەسەر برۆ" },
  },
  {
    src: "/practice/sleep.jpg",
    alt: { en: "Someone asleep by a window at night", ku: "کەسێک لە شەودا لە پاڵ پەنجەرە نووستووە" },
  },
  {
    src: "/practice/ear.jpg",
    alt: { en: "An ear in side light", ku: "گوێیەک لە ڕووناکیی لا" },
  },
  {
    src: "/practice/eyes.jpg",
    alt: { en: "Closed eyes in soft morning light", ku: "چاوی داخراو لە ڕووناکیی بەیانی" },
  },
  {
    src: "/practice/face.jpg",
    alt: { en: "A face in quiet window light", ku: "ڕوخسارێک لە ڕووناکیی ئارامی پەنجەرە" },
  },
  {
    src: "/practice/brow.jpg?v=2",
    alt: { en: "A brow in soft side light", ku: "برۆیەک لە ڕووناکیی نەرمی لا" },
  },
] as const;

export type Lang = "en" | "ku";

export const copy = {
  en: {
    mark: "Dr. Zobairy",
    instagram: "Instagram",
    book: "Book appointment",
    place: "Sna",
    name: "Dr. Hosna Zobairy",
    line: "Nose and facial plastic surgery",
    cred: "Board-certified · Ear, nose and throat",
    menuEn: "EN — English",
    menuKu: "KU — کوردی",
    practice: "Practice",
    items: [
      {
        n: "01",
        slug: "rhinoplasty",
        title: "Rhinoplasty and septorhinoplasty",
        text: "Rhinoplasty changes the shape of the nose. Septorhinoplasty also straightens the septum, so breathing can improve with the shape.",
      },
      {
        n: "02",
        slug: "sinus",
        title: "Sinus surgery",
        text: "Opens sinuses that stay blocked, infected, or painful after medicine. The aim is easier breathing and fewer infections.",
      },
      {
        n: "03",
        slug: "sleep-apnea",
        title: "Sleep apnea",
        text: "For breathing that stops or becomes very shallow in sleep. Surgery is considered when the airway is the cause, after an examination.",
      },
      {
        n: "04",
        slug: "ear",
        title: "Ear surgery",
        text: "Repairs the eardrum, and can bring an ear that sits too far out closer to the head. Hearing and appearance are discussed at the visit.",
      },
      {
        n: "05",
        slug: "blepharoplasty",
        title: "Blepharoplasty",
        text: "Removes extra skin or fat from the upper or lower eyelid, so the eye looks less heavy.",
      },
      {
        n: "06",
        slug: "face",
        title: "Facial rejuvenation",
        text: "Softens a tired face — skin, folds, and contour — with surgery or smaller treatments, chosen for you.",
      },
      {
        n: "07",
        slug: "botox",
        title: "Botox",
        text: "Softens lines on the forehead, between the brows, and around the eyes. Also used for migraine and blepharospasm.",
      },
    ],
    vita: "Vita",
    vitaBody:
      "Dr. Hosna Zobairy is a board-certified ear, nose and throat surgeon in Sna. Her practice is the nose and the face: shape and breathing, the sinuses, sleep, the ear, the eyelids, and facial rejuvenation.",
    facts: [
      { label: "Place", value: "Sna, Abidar" },
      { label: "Visit", value: "Saturday, Sunday, Tuesday · 4 to 8" },
      { label: "Telephone", value: "08733284829", href: `tel:${PHONE}` },
      { label: "Medical council", value: "128359" },
    ],
    publications: "Publications",
    observership: "Observership",
    observerships: [
      { year: "2026", place: "St. Joseph’s Health Centre, Toronto, Canada" },
      { year: "2026", place: "Charité – Universitätsmedizin Berlin, Germany" },
      { year: "2024", place: "Aarhus University Hospital, Aarhus, Denmark" },
      { year: "2019", place: "Hacettepe University, Ankara, Turkey" },
    ],
  },
  ku: {
    mark: "د. زوبەیری",
    instagram: "ئینستاگرام",
    book: "نۆگە بگرە",
    place: "سنە",
    name: "د. حوسنا زوبەیری",
    line: "نەشتەرگەری لووت و جوانکاریی ڕوخسار",
    cred: "بۆرد سەرتیفیکەیت · گوێ، قوڕگ و لووت",
    menuEn: "EN — English",
    menuKu: "KU — کوردی",
    practice: "کار",
    items: [
      {
        n: "01",
        slug: "rhinoplasty",
        title: "نەشتەرگەری لووت و سێپتۆڕاینۆپلاستی",
        text: "نەشتەرگەری لووت شێوەی لووت دەگۆڕێت. سێپتۆڕاینۆپلاستی لە هەمان کاتدا ناوپۆشی لووت ڕاست دەکاتەوە، بۆ هەناسەی باشتر.",
      },
      {
        n: "02",
        slug: "sinus",
        title: "نەشتەرگەری سینوس",
        text: "سینوس دەکاتەوە کاتێک دوای دەرمان هەر داخراو، هەوکردوو یان ئازار بێت. ئامانج هەناسەی ئاسانترە.",
      },
      {
        n: "03",
        slug: "sleep-apnea",
        title: "ئاپنێی خەو",
        text: "بۆ کاتێک هەناسە لە خەودا دەوەستێت یان زۆر لاواز دەبێت. نەشتەرگەری دوای پشکنین دەکرێت، ئەگەر ڕێڕەوی هەوا هۆکار بێت.",
      },
      {
        n: "04",
        slug: "ear",
        title: "نەشتەرگەری گوێ",
        text: "پەردەی گوێ چاک دەکرێتەوە. ئەگەر گوێ زۆر لە سەر دوور بێت، شێوەکەشی دەکرێت ڕێک بخرێتەوە.",
      },
      {
        n: "05",
        slug: "blepharoplasty",
        title: "بلفارۆپلاستی",
        text: "پێستی زیادە یان چەوری لە پێڵووی سەرەوە یان خوارەوە لادەبرێت، بۆ ئەوەی چاو سووکتر دیار بێت.",
      },
      {
        n: "06",
        slug: "face",
        title: "نوێکردنەوەی ڕوخسار",
        text: "ماندوویەتیی ڕوخسار کەم دەکاتەوە — پێست، چڕن و شێوە — بە نەشتەرگەری یان چارەسەری بچووک. هەڵبژاردن دوای مۆشاورەیە.",
      },
      {
        n: "07",
        slug: "botox",
        title: "بۆتۆکس",
        text: "هێڵی ناوچەوان و دەوری چاو نەرم دەکات. هەروەها بۆ میگرێن و بلفارۆسپازم بەکاردێت.",
      },
    ],
    vita: "ژیاننامە",
    vitaBody:
      "د. حوسنا زوبەیری پسپۆڕی بۆردە لە گوێ، قوڕگ و لووت، لە سنە. کارەکەی لووت و ڕوخسارە: شێوە و هەناسە، سینوس، خەو، گوێ، پێڵو، و نوێکردنەوەی ڕوخسار.",
    facts: [
      { label: "شوێن", value: "سنە، شەقامی ئاویەر" },
      { label: "سەردان", value: "شەممە، یەکشەممە، سێشەممە · ٤ تا ٨" },
      { label: "تەلەفۆن", value: "08733284829", href: `tel:${PHONE}` },
      { label: "نظامی پزیشکی", value: "128359" },
    ],
    publications: "بڵاوکراوەکان",
    observership: "چاودێری",
    observerships: [
      { year: "2026", place: "نەخۆشخانەی سەینت جۆزێف، تۆرۆنتۆ، کەنەدا" },
      { year: "2026", place: "شاریتێ، بەرلین، ئەڵمانیا" },
      { year: "2024", place: "نەخۆشخانەی زانکۆی ئارهۆس، ئارهۆس، دانمارک" },
      { year: "2019", place: "زانکۆی حاجەتەپە، ئەنکەرە، تورکیا" },
    ],
  },
} as const;

export function LanguageMenu({ lang, onChange }: { lang: Lang; onChange: (next: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const text = copy[lang];

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
          {(["en", "ku"] as const).map((code) => (
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

function PracticeAccordion({
  lang,
  ku,
  items,
}: {
  lang: Lang;
  items: readonly { n: string; slug: string; title: string; text: string }[];
  ku: boolean;
}) {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <div className="practice-list hidden px-6 py-20 md:px-12 md:py-28">
      <p
        className={`text-xs font-medium uppercase tracking-kicker text-muted ${
          ku ? "font-arabic-sans normal-case" : "font-sans"
        }`}
      >
        {copy[lang].practice}
      </p>
      <ol className="mt-10 max-w-4xl border-b border-line">
        {items.map((item, index) => {
          const expanded = open === index;
          const panelId = `${baseId}-${item.n}`;
          const still = stills[index];
          return (
            <li
              key={item.n}
              className={`grid items-start gap-x-3 border-t border-line py-4 sm:gap-x-4 md:gap-x-6 md:py-5 ${
                expanded
                  ? "grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7.5rem_minmax(0,1fr)] md:grid-cols-[13rem_minmax(0,1fr)]"
                  : "grid-cols-[3.25rem_minmax(0,1fr)] md:grid-cols-[4.75rem_minmax(0,1fr)]"
              }`}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                onClick={() => setOpen(expanded ? -1 : index)}
                className="col-start-1 row-start-1"
              >
                <img
                  src={still.src}
                  alt=""
                  className={`w-full bg-photo object-cover ${expanded ? "aspect-[3/4]" : "h-14 md:h-16"}`}
                />
              </button>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? -1 : index)}
                className="col-start-2 row-start-1 flex min-h-14 w-full min-w-0 items-center gap-3 text-start md:gap-4"
              >
                <span className="w-8 shrink-0 font-sans text-xs font-medium text-muted tabular-nums">{item.n}</span>
                <span
                  className={`min-w-0 flex-1 text-xl leading-tight break-words text-ink sm:text-2xl md:text-3xl ${
                    ku ? "font-arabic" : "font-display"
                  }`}
                >
                  {item.title}
                </span>
                <span className="w-6 shrink-0 text-center font-sans text-lg leading-none text-muted" aria-hidden>
                  {expanded ? "–" : "+"}
                </span>
              </button>
              {expanded ? (
                <p
                  id={panelId}
                  className={`col-start-2 row-start-2 mt-3 max-w-xl min-w-0 ps-11 text-base leading-relaxed break-words text-muted md:ps-12 ${
                    ku ? "font-arabic-sans" : "font-sans"
                  }`}
                >
                  {item.text}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function layerOpacity(index: number, scaled: number) {
  const distance = scaled - index;
  if (distance >= 0 && distance < 0.5) return 1;
  if (distance >= 0.5 && distance < 1) return 1 - smoothstep((distance - 0.5) / 0.5);
  if (distance < 0 && distance > -0.5) return smoothstep((distance + 0.5) / 0.5);
  return 0;
}

function PracticeScrub({
  lang,
  ku,
  items,
}: {
  lang: Lang;
  items: readonly { n: string; slug: string; title: string; text: string }[];
  ku: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const copyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dashRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    let frame = 0;
    let current = 0;
    let target = 0;
    let lastIndex = -1;

    const paint = (scaled: number) => {
      const index = Math.min(items.length - 1, Math.floor(scaled));
      imageRefs.current.forEach((img, imageIndex) => {
        if (!img) return;
        const opacity = layerOpacity(imageIndex, scaled);
        const travel = Math.min(Math.max(scaled - imageIndex, 0), 1);
        img.style.opacity = opacity.toFixed(3);
        img.style.transform = `scale(${(1.05 - travel * 0.05).toFixed(4)}) translate3d(${((travel - 0.5) * 1.4).toFixed(3)}%, 0, 0)`;
      });
      copyRefs.current.forEach((node, copyIndex) => {
        if (!node) return;
        const distance = scaled - copyIndex;
        let opacity = 0;
        if (distance >= -0.4 && distance < 0) opacity = smoothstep((distance + 0.4) / 0.4);
        else if (distance >= 0 && distance < 0.62) opacity = 1;
        else if (distance >= 0.62 && distance < 1) opacity = 1 - smoothstep((distance - 0.62) / 0.38);
        node.style.opacity = opacity.toFixed(3);
        node.style.transform = `translate3d(0, ${((1 - opacity) * 12).toFixed(2)}px, 0)`;
      });
      if (index !== lastIndex) {
        lastIndex = index;
        dashRefs.current.forEach((dash, dashIndex) => {
          if (!dash) return;
          const on = dashIndex === index;
          dash.style.width = on ? "2.5rem" : "1rem";
          dash.style.backgroundColor = on ? "#1c1917" : "#e3dfd8";
          dash.setAttribute("aria-current", on ? "true" : "false");
        });
        if (countRef.current) {
          countRef.current.textContent = `${items[index].n} / ${items[items.length - 1].n}`;
        }
      }
    };

    const measure = () => {
      const view = stage.offsetHeight || 1;
      const total = Math.max(track.offsetHeight - view, 1);
      const scrolled = Math.min(Math.max(-track.getBoundingClientRect().top, 0), total);
      target = Math.min(items.length - 0.0001, (scrolled / total) * items.length);
    };

    let last = performance.now();

    const tick = (now: number) => {
      measure();
      const dt = Math.min(34, now - last);
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / 80));
      if (Math.abs(target - current) < 0.0006) current = target;
      paint(current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [items, lang]);

  function goTo(chapter: number) {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + chapter * stage.offsetHeight, behavior: "smooth" });
  }

  return (
    <div
      ref={trackRef}
      className="practice-scrub relative"
      style={{ height: `calc(${items.length + 1} * (100svh - 4.75rem))` }}
    >
      <div ref={stageRef} className="sticky top-stage flex h-stage flex-col lg:grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="order-2 flex shrink-0 flex-col justify-end px-4 pt-4 pb-5 sm:px-6 lg:order-1 lg:justify-center lg:px-12 lg:py-0 xl:px-20">
          <p
            className={`text-xs font-medium uppercase tracking-kicker text-muted ${
              ku ? "font-arabic-sans normal-case" : "font-sans"
            }`}
          >
            {copy[lang].practice}
          </p>
          <div className="relative mt-3 h-52 sm:h-56 lg:mt-8 lg:h-64">
            {items.map((item, itemIndex) => (
              <div
                key={item.n}
                ref={(node) => {
                  copyRefs.current[itemIndex] = node;
                }}
                className="absolute inset-x-0 top-0"
                style={{ opacity: itemIndex === 0 ? 1 : 0 }}
              >
                <p className="font-sans text-xs font-medium text-muted tabular-nums">{item.n}</p>
                <h2 className={`mt-2 text-2xl leading-tight text-ink sm:text-3xl lg:mt-3 lg:text-4xl xl:text-5xl ${ku ? "font-arabic" : "font-display"}`}>
                  {item.title}
                </h2>
                <p className={`mt-2 max-w-md text-sm leading-relaxed text-muted lg:mt-4 lg:text-base ${ku ? "font-arabic-sans" : "font-sans"}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 lg:mt-10">
            {items.map((chapter, chapterIndex) => (
              <button
                key={chapter.n}
                ref={(node) => {
                  dashRefs.current[chapterIndex] = node;
                }}
                type="button"
                aria-label={chapter.title}
                aria-current={chapterIndex === 0 ? "true" : undefined}
                onClick={() => goTo(chapterIndex)}
                className="h-px bg-line"
                style={{ width: chapterIndex === 0 ? "2.5rem" : "1rem", backgroundColor: chapterIndex === 0 ? "#1c1917" : "#e3dfd8" }}
              />
            ))}
            <span ref={countRef} className="ms-2 font-sans text-xs text-muted tabular-nums">
              {items[0].n} / {items[items.length - 1].n}
            </span>
          </div>
        </div>
        <div className="relative order-1 min-h-0 flex-1 overflow-hidden bg-photo lg:order-2">
          {stills.map((still, stillIndex) => (
            <img
              key={still.src}
              ref={(node) => {
                imageRefs.current[stillIndex] = node;
              }}
              src={still.src}
              alt={stillIndex === 0 ? still.alt[lang] : ""}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ opacity: stillIndex === 0 ? 1 : 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PracticeList({
  lang,
  ku,
  items,
}: {
  lang: Lang;
  items: readonly { n: string; slug: string; title: string; text: string }[];
  ku: boolean;
}) {
  return (
    <section id="practice" aria-label={copy[lang].practice}>
      <PracticeAccordion lang={lang} ku={ku} items={items} />
      <PracticeScrub lang={lang} ku={ku} items={items} />
    </section>
  );
}

function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const text = copy[lang];
  const ku = lang === "ku";

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
          <a
            href="#vita"
            className={`hidden text-sm text-muted transition-colors duration-200 hover:text-ink md:inline ${
              ku ? "font-arabic-sans" : ""
            }`}
          >
            {text.vita}
          </a>
          <LanguageMenu lang={lang} onChange={chooseLang} />
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

      <section className="grid min-h-hero md:grid-cols-2">
        <div className="flex flex-col justify-end gap-6 px-6 py-12 md:justify-center md:px-12 md:py-16 lg:px-20">
          <p
            className={`text-xs font-medium uppercase tracking-kicker text-muted ${
              ku ? "font-arabic-sans normal-case" : "font-sans"
            }`}
          >
            {text.place}
          </p>
          <h1
            className={`text-4xl leading-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl ${
              ku ? "font-arabic" : "font-display"
            }`}
          >
            {text.name}
          </h1>
          <p className={`max-w-sm text-lg font-light leading-relaxed text-ink ${ku ? "font-arabic-sans" : "font-sans"}`}>
            {text.line}
          </p>
          <p className={`text-sm text-muted ${ku ? "font-arabic-sans" : "font-sans"}`}>{text.cred}</p>
          <a
            href={`tel:${PHONE}`}
            className={`mt-2 inline-flex min-h-11 w-fit items-center border-b border-ink text-sm text-ink ${
              ku ? "font-arabic-sans" : "font-sans"
            }`}
          >
            {text.book}
          </a>
        </div>

        <figure className="relative aspect-3/4 bg-photo md:aspect-auto md:min-h-full">
          <img
            src="/portrait.png"
            alt={text.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </figure>
      </section>

      <PracticeList lang={lang} ku={ku} items={text.items} />

      <section id="vita" aria-labelledby="vita-title" className="scroll-mt-24 border-t border-line px-6 py-20 md:px-12 md:py-28 lg:px-20">
        <p
          id="vita-title"
          className={`text-xs font-medium uppercase tracking-kicker text-muted ${
            ku ? "font-arabic-sans normal-case" : "font-sans"
          }`}
        >
          {text.vita}
        </p>
        <p
          className={`mt-8 max-w-xl text-lg leading-relaxed text-ink ${
            ku ? "font-arabic-sans" : "font-sans font-light"
          }`}
        >
          {text.vitaBody}
        </p>
        <dl className="mt-12 max-w-xl">
          {text.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 border-t border-line py-5 sm:flex-row sm:gap-8">
              <dt
                className={`w-36 shrink-0 text-xs font-medium uppercase tracking-kicker text-muted ${
                  ku ? "font-arabic-sans normal-case" : "font-sans"
                }`}
              >
                {fact.label}
              </dt>
              <dd className={`text-base text-ink ${ku ? "font-arabic-sans" : "font-sans"}`}>
                {"href" in fact ? (
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
        <h2
          className={`mt-16 text-xs font-medium uppercase tracking-kicker text-muted ${
            ku ? "font-arabic-sans normal-case" : "font-sans"
          }`}
        >
          {text.observership}
        </h2>
        <ol className="mt-6 max-w-3xl">
          {text.observerships.map((item) => (
            <li key={item.place} className="flex min-w-0 gap-4 border-t border-line py-5 sm:gap-8">
              <span className="w-12 shrink-0 pt-1 font-sans text-xs font-medium text-muted tabular-nums">
                {item.year}
              </span>
              <p className={`min-w-0 text-base leading-relaxed break-words text-ink ${ku ? "font-arabic-sans" : "font-sans"}`}>
                {item.place}
              </p>
            </li>
          ))}
        </ol>
        <h2
          className={`mt-16 text-xs font-medium uppercase tracking-kicker text-muted ${
            ku ? "font-arabic-sans normal-case" : "font-sans"
          }`}
        >
          {text.publications}
        </h2>
        <ol className="mt-6 max-w-3xl">
          {papers.map((paper) => (
            <li key={paper.title} className="flex min-w-0 gap-4 border-t border-line py-5 sm:gap-8">
              <span className="w-12 shrink-0 pt-1 font-sans text-xs font-medium text-muted tabular-nums">
                {paper.year}
              </span>
              <div className="min-w-0">
                {"href" in paper ? (
                  <a
                    href={paper.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-base leading-relaxed break-words text-ink underline decoration-line underline-offset-4"
                  >
                    {paper.title}
                  </a>
                ) : (
                  <p className="font-sans text-base leading-relaxed text-ink">{paper.title}</p>
                )}
                <p className="mt-1 font-sans text-sm text-muted">{paper.venue}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
