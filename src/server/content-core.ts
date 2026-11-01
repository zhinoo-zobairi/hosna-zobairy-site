/** Content versioning without framework imports, so `node --test` can run it against PGlite. */
import { defaultContent } from "../content/default.ts";
import { siteContentSchema, type SiteContent } from "../content/schema.ts";
import type { Sql } from "../lib/db.ts";

export type ContentVersion = { id: number; created_at: Date; created_by: string };
export type RestoreResult = { ok: true; id: number } | { ok: false };

/** Newest saved content that passes the schema. The bundled default when there is none or the query fails. Never throws. */
export async function getLatestContent(sql: Sql): Promise<SiteContent> {
  try {
    const rows = await sql<{ id: number; content: unknown }>`
      select id, content from content_versions order by id desc limit 20`;
    for (const row of rows) {
      const parsed = siteContentSchema.safeParse(row.content);
      if (parsed.success) return parsed.data;
      console.error(`[content] version ${row.id} does not match the schema; trying the previous one`);
    }
  } catch (err) {
    console.error(`[content] reading content failed: ${err instanceof Error ? err.message : "unknown error"}`);
  }
  return defaultContent;
}

export async function getContentForEditCore(
  sql: Sql,
): Promise<{ content: SiteContent; versions: ContentVersion[] }> {
  const content = await getLatestContent(sql);
  const versions = await sql<ContentVersion>`
    select id, created_at, created_by from content_versions order by id desc`;
  return { content, versions };
}

/** Every save is a new row; all rows are kept. The first save also stores the bundled text as a 'seed' row, so it stays restorable. */
export async function saveContentCore(
  sql: Sql,
  content: SiteContent,
  createdBy: string,
): Promise<{ ok: true; id: number }> {
  const valid = siteContentSchema.parse(content);
  await sql`
    insert into content_versions (created_by, content)
    select 'seed', ${JSON.stringify(defaultContent)}::jsonb
    where not exists (select 1 from content_versions)`;
  const [row] = await sql<{ id: number }>`
    insert into content_versions (created_by, content)
    values (${createdBy}, ${JSON.stringify(valid)}::jsonb)
    returning id`;
  return { ok: true, id: row.id };
}

/** Copies an old version as the new latest row. Refuses a missing id or content the current schema rejects. */
export async function restoreContentVersionCore(
  sql: Sql,
  id: number,
  createdBy: string,
): Promise<RestoreResult> {
  const [row] = await sql<{ content: unknown }>`select content from content_versions where id = ${id}`;
  const parsed = row ? siteContentSchema.safeParse(row.content) : undefined;
  if (!parsed?.success) return { ok: false };
  return saveContentCore(sql, parsed.data, createdBy);
}
