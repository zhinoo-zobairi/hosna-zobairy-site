import type { Sql } from "../lib/db.ts";

/**
 * Sliding-window limit stored in `rate_limits`. Returns true (and records the request)
 * when the key is under `max` requests in the last `windowSeconds`, else false.
 * Count and insert are one statement, so the race window is small but not zero:
 * a burst of truly simultaneous requests can pass the limit by a few. Fine for spam.
 */
export async function checkAndRecord(
  sql: Sql,
  key: string,
  { max, windowSeconds }: { max: number; windowSeconds: number },
): Promise<boolean> {
  await sql`delete from rate_limits where created_at < now() - interval '1 day'`;
  const inserted = await sql`
    insert into rate_limits (key)
    select ${key}::text
    where (
      select count(*) from rate_limits
      where key = ${key} and created_at > now() - ${windowSeconds}::int * interval '1 second'
    ) < ${max}::int
    returning key`;
  return inserted.length === 1;
}
