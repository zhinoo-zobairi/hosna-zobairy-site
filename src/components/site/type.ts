import type { Lang } from "@/content/constants";
import type { Copy } from "@/content/schema";

/** Props every chapter takes. */
export type ChapterProps = { text: Copy; lang: Lang; motion: boolean };

/** Kurdish uses the Arabic-script faces. Letter-spacing breaks Arabic joining, so Kurdish labels drop it. */
export const display = (ku: boolean) => (ku ? "font-arabic" : "font-display");
export const sans = (ku: boolean) => (ku ? "font-arabic-sans" : "font-sans");
export const kicker = (ku: boolean) =>
  `text-xs font-medium text-muted ${ku ? "font-arabic-sans" : "font-sans uppercase tracking-kicker"}`;
