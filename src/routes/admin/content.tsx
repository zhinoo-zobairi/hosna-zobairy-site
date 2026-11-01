import { createContext, useContext, useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import type { z } from "zod";
import { siteContentSchema, type Copy, type SiteContent } from "@/content/schema";
import { getContentForEdit, restoreContentVersion, saveContent } from "@/server/content";
import { buttonClass, formatDate, inputClass, primaryButtonClass } from "./-ui";

export const Route = createFileRoute("/admin/content")({
  loader: () => getContentForEdit(),
  component: ContentEditor,
});

type Lang = "en" | "ku";
type Path = (string | number)[];
type Errors = Record<string, string>;
type CopyTextKey = { [K in keyof Copy]: Copy[K] extends string ? K : never }[keyof Copy];

const LANGS: Lang[] = ["en", "ku"];
const TEXT_FIELDS: { key: CopyTextKey; label: string; multiline?: boolean }[] = [
  { key: "mark", label: "Mark (header name)" },
  { key: "instagram", label: "Instagram link" },
  { key: "book", label: "Book button" },
  { key: "menuEn", label: "Menu: English" },
  { key: "menuKu", label: "Menu: Kurdish" },
  { key: "name", label: "Name" },
  { key: "line", label: "Tagline" },
  { key: "cred", label: "Credentials" },
  { key: "place", label: "Place" },
  { key: "statement", label: "Statement", multiline: true },
  { key: "practice", label: "Practice title" },
  { key: "observership", label: "Observerships title" },
  { key: "publications", label: "Publications title" },
  { key: "vita", label: "Vita title" },
  { key: "vitaBody", label: "Vita text", multiline: true },
  { key: "visit", label: "Visit title" },
];
const FORM_KEYS = Object.keys(siteContentSchema.shape.en.shape.form.shape) as (keyof Copy["form"])[];

function humanize(key: string): string {
  const words = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function getIn(value: unknown, path: Path): unknown {
  return path.reduce<unknown>((current, key) => (current as Record<string | number, unknown> | undefined)?.[key], value);
}

function setIn<T>(value: T, path: Path, next: unknown): T {
  const copy = structuredClone(value);
  const parent = getIn(copy, path.slice(0, -1)) as Record<string | number, unknown>;
  const key = path[path.length - 1];
  if (next === undefined) delete parent[key];
  else parent[key] = next;
  return copy;
}

function toErrors(error: z.ZodError): Errors {
  const errors: Errors = {};
  for (const issue of error.issues) {
    errors[issue.path.join(".")] ??= issue.code === "too_small" ? "Required" : issue.message;
  }
  return errors;
}

type Editor = { draft: SiteContent; errors: Errors; update: (path: Path, value: unknown) => void };
const EditorContext = createContext<Editor | null>(null);

function useEditor(): Editor {
  const editor = useContext(EditorContext);
  if (!editor) throw new Error("useEditor outside the content editor");
  return editor;
}

type Status = { kind: "idle" | "busy" | "ok" | "error"; text: string };

function ContentEditor() {
  const { content, versions } = Route.useLoaderData();
  const router = useRouter();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });

  // Fresh loader data after a save or restore replaces the draft.
  useEffect(() => {
    setDraft(content);
    setErrors({});
  }, [content]);

  const update = (path: Path, value: unknown) => setDraft((current) => setIn(current, path, value));

  async function save() {
    const parsed = siteContentSchema.safeParse(draft);
    if (!parsed.success) {
      const found = toErrors(parsed.error);
      setErrors(found);
      setStatus({ kind: "error", text: `Fix ${Object.keys(found).length} field(s) before saving.` });
      return;
    }
    setErrors({});
    setStatus({ kind: "busy", text: "Saving…" });
    try {
      const { id } = await saveContent({ data: parsed.data });
      await router.invalidate();
      setStatus({ kind: "ok", text: `Saved as version ${id}. The public site shows it within a minute.` });
    } catch {
      setStatus({ kind: "error", text: "Saving failed. Try again." });
    }
  }

  async function restore(id: number) {
    if (!window.confirm(`Restore version ${id}? It becomes the live content, and unsaved edits here are lost.`)) return;
    setStatus({ kind: "busy", text: "Restoring…" });
    try {
      const result = await restoreContentVersion({ data: { id } });
      if (!result.ok) {
        setStatus({ kind: "error", text: `Version ${id} cannot be restored: it does not match the current fields.` });
        return;
      }
      await router.invalidate();
      setStatus({ kind: "ok", text: `Version ${id} restored as version ${result.id}.` });
    } catch {
      setStatus({ kind: "error", text: "Restoring failed. Try again." });
    }
  }

  return (
    <EditorContext.Provider value={{ draft, errors, update }}>
      <h1 className="font-display text-3xl">Site content</h1>
      <p className="mt-2 text-sm text-muted">Each text has an English (EN) and a Kurdish (KU) version. Every save is kept as a version.</p>
      <TextSection />
      <ProceduresSection />
      <FactsSection />
      <ObservershipsSection />
      <PapersSection />
      <FormLabelsSection />
      <ErrorSummary />
      <div className="sticky bottom-0 mt-10 flex flex-wrap items-center gap-4 border-t border-line bg-paper py-4">
        <button type="button" onClick={save} disabled={status.kind === "busy"} className={primaryButtonClass}>
          Save content
        </button>
        <p role="status" className={`text-sm ${status.kind === "error" ? "text-red-700" : "text-muted"}`}>
          {status.text}
        </p>
      </div>
      <VersionsList versions={versions} onRestore={restore} busy={status.kind === "busy"} />
    </EditorContext.Provider>
  );
}

function Field(props: {
  path: Path;
  label?: string;
  ariaLabel?: string;
  lang?: Lang;
  multiline?: boolean;
  optional?: boolean;
  ltr?: boolean;
}) {
  const { draft, errors, update } = useEditor();
  const { path, label, ariaLabel, lang, multiline, optional, ltr } = props;
  const error = errors[path.join(".")];
  const rtl = lang === "ku" && !ltr;
  const control = {
    value: (getIn(draft, path) as string | undefined) ?? "",
    dir: rtl ? ("rtl" as const) : undefined,
    lang: lang === "ku" ? "ckb" : lang,
    "aria-label": ariaLabel,
    "aria-invalid": error ? true : undefined,
    className: `${inputClass} ${rtl ? "font-arabic-sans" : ""} ${error ? "border-red-700" : ""}`,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(path, optional && event.target.value.trim() === "" ? undefined : event.target.value),
  };
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs text-muted">{label}</span>}
      {multiline ? (
        <textarea rows={3} {...control} className={`${control.className} field-sizing-content`} />
      ) : (
        <input {...control} />
      )}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** One label with the English and Kurdish inputs side by side. `path` is inside a copy. */
function PairRow({ label, path, multiline }: { label: string; path: Path; multiline?: boolean }) {
  return (
    <div className="grid gap-2 border-t border-line py-3 md:grid-cols-[12rem_1fr_1fr] md:gap-4">
      <div className="text-sm">{label}</div>
      {LANGS.map((lang) => (
        <div key={lang}>
          <span className="mb-1 block text-xs text-muted uppercase md:hidden">{lang}</span>
          <Field
            path={[lang, ...path]}
            lang={lang}
            ariaLabel={`${label} (${lang.toUpperCase()})`}
            multiline={multiline}
          />
        </div>
      ))}
    </div>
  );
}

function TextSection() {
  return (
    <Section title="Page text">
      {TEXT_FIELDS.map(({ key, label, multiline }) => (
        <PairRow key={key} label={label} path={[key]} multiline={multiline} />
      ))}
    </Section>
  );
}

function ProceduresSection() {
  const { draft, errors } = useEditor();
  return (
    <Section title="Procedures" note="Always 7, in this order. Number and slug are fixed.">
      {LANGS.map((lang) => errors[`${lang}.items`] && (
        <p key={lang} className="text-sm text-red-700">{errors[`${lang}.items`]}</p>
      ))}
      {draft.en.items.map((item, i) => (
        <div key={item.slug} className="mt-4">
          <h3 className="text-sm font-medium">
            {item.n} · <span className="text-muted">{item.slug}</span>
          </h3>
          <PairRow label="Title" path={["items", i, "title"]} />
          <PairRow label="Text" path={["items", i, "text"]} multiline />
        </div>
      ))}
    </Section>
  );
}

function FactsSection() {
  const { draft } = useEditor();
  return (
    <Section title="Facts" note="Shown in the Visit chapter. A link is optional, for example tel:+988733284829.">
      <div className="grid gap-8 md:grid-cols-2">
        {LANGS.map((lang) => (
          <div key={lang}>
            <h3 className="text-xs text-muted uppercase">{lang}</h3>
            {draft[lang].facts.map((_, i) => (
              <div key={i} className="mt-3 grid gap-2 border-t border-line pt-3">
                <Field path={[lang, "facts", i, "label"]} lang={lang} label="Label" />
                <Field path={[lang, "facts", i, "value"]} lang={lang} label="Value" />
                <Field path={[lang, "facts", i, "href"]} lang={lang} label="Link (optional)" optional ltr />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ObservershipsSection() {
  const { draft, update } = useEditor();
  return (
    <Section title="Observerships" note="Hospital, then town, then country.">
      <div className="grid gap-8 md:grid-cols-2">
        {LANGS.map((lang) => {
          const list = draft[lang].observerships;
          return (
            <div key={lang}>
              <h3 className="text-xs text-muted uppercase">{lang}</h3>
              {list.map((_, i) => (
                <div key={i} className="mt-3 flex items-end gap-2 border-t border-line pt-3">
                  <div className="w-24 shrink-0">
                    <Field path={[lang, "observerships", i, "year"]} lang={lang} label="Year" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Field path={[lang, "observerships", i, "place"]} lang={lang} label="Place" />
                  </div>
                  <button
                    type="button"
                    onClick={() => update([lang, "observerships"], list.filter((_, j) => j !== i))}
                    className={buttonClass}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update([lang, "observerships"], [...list, { year: "", place: "" }])}
                className={`${buttonClass} mt-3`}
              >
                Add observership
              </button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function PapersSection() {
  const { draft, update } = useEditor();
  return (
    <Section title="Publications" note="Shared by both languages. Only real papers: never invent titles, venues or years.">
      {draft.papers.map((_, i) => (
        <div key={i} className="grid gap-2 border-t border-line py-3 md:grid-cols-[6rem_1fr_1fr_auto] md:items-start">
          <Field path={["papers", i, "year"]} label="Year" />
          <Field path={["papers", i, "title"]} label="Title" multiline />
          <div className="grid gap-2">
            <Field path={["papers", i, "venue"]} label="Venue" />
            <Field path={["papers", i, "href"]} label="Link (optional)" optional />
          </div>
          <button
            type="button"
            onClick={() => update(["papers"], draft.papers.filter((_, j) => j !== i))}
            className={`${buttonClass} md:mt-5`}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update(["papers"], [...draft.papers, { year: "", title: "", venue: "" }])}
        className={`${buttonClass} mt-3`}
      >
        Add publication
      </button>
    </Section>
  );
}

function FormLabelsSection() {
  return (
    <Section title="Appointment form" note="Labels and messages of the form in the Visit chapter.">
      {FORM_KEYS.map((key) => (
        <PairRow key={key} label={humanize(key)} path={["form", key]} />
      ))}
    </Section>
  );
}

function ErrorSummary() {
  const { errors } = useEditor();
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  return (
    <div role="alert" className="mt-10 border border-red-700 p-4 text-sm text-red-700">
      <p className="font-medium">Some fields need attention:</p>
      <ul className="mt-2 list-disc ps-5">
        {entries.map(([path, message]) => (
          <li key={path}>
            {path.split(".").join(" › ")}: {message}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Version = { id: number; created_at: Date; created_by: string };

function VersionsList({ versions, onRestore, busy }: { versions: Version[]; onRestore: (id: number) => void; busy: boolean }) {
  return (
    <Section title="Versions" note="Newest first. Restoring copies an old version as the new live one.">
      {versions.length === 0 ? (
        <p className="text-sm text-muted">Nothing saved yet. The site shows the built-in text.</p>
      ) : (
        <ul>
          {versions.map((version, i) => (
            <li key={version.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line py-2 text-sm">
              <span className="w-12 font-medium">#{version.id}</span>
              <span className="text-muted">{formatDate(version.created_at)}</span>
              <span className="text-muted">{version.created_by}</span>
              <span className="ml-auto">
                {i === 0 ? (
                  <span className="text-muted">Live</span>
                ) : (
                  <button type="button" disabled={busy} onClick={() => onRestore(version.id)} className={buttonClass}>
                    Restore
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
