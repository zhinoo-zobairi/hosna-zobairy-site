import { createServerFn } from "@tanstack/react-start";
import { defaultContent } from "../content/default.ts";
import type { SiteContent } from "../content/schema.ts";

/** Public. Latest saved content, or the bundled default. Stub: always the default. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => defaultContent,
);
