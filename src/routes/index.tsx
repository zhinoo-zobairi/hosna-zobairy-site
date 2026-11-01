import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getSiteContent } from "@/server/content";
import { useMotionOk } from "@/lib/use-motion-ok";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Statement } from "@/components/site/Statement";
import { Practice } from "@/components/site/Practice";
import { Training } from "@/components/site/Training";
import { Publications } from "@/components/site/Publications";
import { Visit } from "@/components/site/Visit";
import { useLang } from "@/components/site/use-lang";

export const Route = createFileRoute("/")({
  loader: () => getSiteContent(),
  headers: () => ({ "Cache-Control": "public, s-maxage=60" }),
  component: Home,
});

function Home() {
  const content = Route.useLoaderData();
  const [lang, setLang] = useLang();
  const motion = useMotionOk();
  const text = content[lang];
  const chapter = { text, lang, motion };

  // The pinned layout is much taller than the stacked one; re-aim a #hash once it takes over.
  useEffect(() => {
    if (!motion) return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [motion]);

  return (
    <div dir={lang === "ku" ? "rtl" : "ltr"} className="bg-paper text-ink">
      <Header text={text} lang={lang} onLang={setLang} />
      <main>
        <Hero {...chapter} />
        <Statement {...chapter} />
        <Practice {...chapter} />
        <Training {...chapter} />
        <Publications {...chapter} papers={content.papers} />
        <Visit {...chapter} />
      </main>
    </div>
  );
}
