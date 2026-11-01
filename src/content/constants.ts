export const PHONE = "+988733284829";
export const INSTAGRAM = "https://www.instagram.com/dr.hosnazobairy/";
export const LANG_KEY = "zobairy-lang";

export const LANGS = ["en", "ku"] as const;
export type Lang = (typeof LANGS)[number];

/** Fixed order: matches `stills` and the `/practice/$slug` pages. */
export const PROCEDURE_SLUGS = [
  "rhinoplasty",
  "sinus",
  "sleep-apnea",
  "ear",
  "blepharoplasty",
  "face",
  "botox",
] as const;
export type ProcedureSlug = (typeof PROCEDURE_SLUGS)[number];
