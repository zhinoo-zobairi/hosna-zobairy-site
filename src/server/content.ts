import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { defaultContent } from "../content/default.ts";
import { siteContentSchema, type SiteContent } from "../content/schema.ts";
import { adminMiddleware } from "./admin-middleware";
import {
  getContentForEditCore,
  getLatestContent,
  restoreContentVersionCore,
  saveContentCore,
} from "./content-core.ts";

export type { ContentVersion, RestoreResult } from "./content-core.ts";

/** Public. Latest saved content, or the bundled default. Never throws. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    try {
      return await getLatestContent(await getSql());
    } catch (err) {
      console.error(`[content] database unavailable: ${err instanceof Error ? err.message : "unknown error"}`);
      return defaultContent;
    }
  },
);

/** Admin. The content to edit plus every saved version, newest first. */
export const getContentForEdit = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => getContentForEditCore(await getSql()));

export const saveContent = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(siteContentSchema)
  .handler(async ({ data, context }) => saveContentCore(await getSql(), data, context.adminEmail));

export const restoreContentVersion = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data, context }) =>
    restoreContentVersionCore(await getSql(), data.id, context.adminEmail),
  );
