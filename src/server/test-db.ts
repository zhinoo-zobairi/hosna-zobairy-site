/** Test helper: a fresh in-memory PGlite with both migrations, behind the app's `Sql` surface. */
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "../lib/db.ts";

const MIGRATIONS = ["0001_auth.sql", "0002_site.sql"];

export async function createTestDb(): Promise<{ sql: Sql; pg: PGlite }> {
  // Same parsers as src/lib/db.ts: int8 -> number, so count(*) and ids are plain numbers.
  const pg = new PGlite({ parsers: { 20: Number } });
  for (const name of MIGRATIONS) {
    await pg.exec(readFileSync(new URL(`../../migrations/${name}`, import.meta.url), "utf8"));
  }
  const run = async <T>(text: string, params: unknown[] = []): Promise<T[]> =>
    (await pg.query<T>(text, params)).rows;
  const sql = (<T>(strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as Sql;
  sql.query = run;
  return { sql, pg };
}
