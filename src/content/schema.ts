import { z } from "zod";
import { PROCEDURE_SLUGS } from "./constants.ts";

const text = z.string().trim().min(1).max(2000);

const formSchema = z.object({
  name: text,
  phone: text,
  procedure: text,
  procedureOther: text,
  day: text,
  dayAny: text,
  daySat: text,
  daySun: text,
  dayTue: text,
  note: text,
  submit: text,
  sending: text,
  success: text,
  invalid: text,
  rateLimited: text,
  error: text,
  consent: text,
});

const copySchema = z.object({
  mark: text,
  instagram: text,
  book: text,
  place: text,
  name: text,
  line: text,
  cred: text,
  menuEn: text,
  menuKu: text,
  statement: text,
  practice: text,
  items: z
    .array(
      z.object({
        n: text,
        slug: z.enum(PROCEDURE_SLUGS),
        title: text,
        text: text,
      }),
    )
    .length(PROCEDURE_SLUGS.length)
    .refine((items) => items.every((item, i) => item.slug === PROCEDURE_SLUGS[i]), {
      message: "Procedures must keep their fixed order",
    }),
  vita: text,
  vitaBody: text,
  facts: z.array(z.object({ label: text, value: text, href: text.optional() })),
  publications: text,
  observership: text,
  observerships: z.array(z.object({ year: text, place: text })),
  visit: text,
  form: formSchema,
});

export const siteContentSchema = z.object({
  en: copySchema,
  ku: copySchema,
  papers: z.array(z.object({ year: text, title: text, venue: text, href: z.url().optional() })),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type Copy = SiteContent["en"];
export type Paper = SiteContent["papers"][number];
