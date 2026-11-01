import assert from "node:assert/strict";
import { test } from "node:test";
import { checkAndRecord } from "./rate-limit.ts";
import { createTestDb } from "./test-db.ts";

const LIMIT = { max: 5, windowSeconds: 3600 };

test("the 5th request is allowed and the 6th is rejected", async () => {
  const { sql } = await createTestDb();
  for (let i = 1; i <= 5; i += 1) {
    assert.equal(await checkAndRecord(sql, "appt:a", LIMIT), true, `request ${i}`);
  }
  assert.equal(await checkAndRecord(sql, "appt:a", LIMIT), false);
});

test("a different key has its own budget", async () => {
  const { sql } = await createTestDb();
  for (let i = 0; i < 5; i += 1) await checkAndRecord(sql, "appt:a", LIMIT);
  assert.equal(await checkAndRecord(sql, "appt:b", LIMIT), true);
});

test("rows older than the window don't count, and rows older than a day are deleted", async () => {
  const { sql } = await createTestDb();
  for (let i = 0; i < 5; i += 1) {
    await sql`insert into rate_limits (key, created_at) values ('appt:a', now() - interval '2 hours')`;
  }
  await sql`insert into rate_limits (key, created_at) values ('appt:a', now() - interval '2 days')`;
  assert.equal(await checkAndRecord(sql, "appt:a", LIMIT), true);
  const [{ count }] = await sql<{ count: number }>`
    select count(*)::int as count from rate_limits where created_at < now() - interval '1 day'`;
  assert.equal(count, 0);
});
