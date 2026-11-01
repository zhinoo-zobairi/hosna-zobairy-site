import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultContent } from "../content/default.ts";
import type { Sql } from "../lib/db.ts";
import {
  getContentForEditCore,
  getLatestContent,
  restoreContentVersionCore,
  saveContentCore,
} from "./content-core.ts";
import { createTestDb } from "./test-db.ts";

test("an empty table returns the default content", async () => {
  const { sql } = await createTestDb();
  assert.deepEqual(await getLatestContent(sql), defaultContent);
});

test("a corrupt only row returns the default content", async () => {
  const { sql } = await createTestDb();
  await sql`insert into content_versions (created_by, content) values ('seed', '{"en": "broken"}'::jsonb)`;
  assert.deepEqual(await getLatestContent(sql), defaultContent);
});

test("a corrupt latest row falls back to the newest valid version", async () => {
  const { sql } = await createTestDb();
  const edited = structuredClone(defaultContent);
  edited.en.line = "Edited line";
  await saveContentCore(sql, edited, "admin@example.test");
  await sql`insert into content_versions (created_by, content) values ('seed', '{"en": "broken"}'::jsonb)`;
  assert.equal((await getLatestContent(sql)).en.line, "Edited line");
});

test("a failing database returns the default content instead of throwing", async () => {
  const broken = (async () => {
    throw new Error("connection refused");
  }) as unknown as Sql;
  assert.deepEqual(await getLatestContent(broken), defaultContent);
});

test("save then get returns the saved content", async () => {
  const { sql } = await createTestDb();
  const edited = structuredClone(defaultContent);
  edited.en.statement = "An edited statement.";
  const saved = await saveContentCore(sql, edited, "admin@example.test");
  assert.equal(saved.ok, true);
  assert.deepEqual(await getLatestContent(sql), edited);
  const { versions } = await getContentForEditCore(sql);
  assert.deepEqual(
    versions.map((v) => v.created_by),
    ["admin@example.test", "seed"],
  );
  assert.equal(versions[0].id, saved.id);
});

test("the first save keeps the original text as a restorable seed version", async () => {
  const { sql } = await createTestDb();
  const edited = structuredClone(defaultContent);
  edited.en.line = "Edited line";
  await saveContentCore(sql, edited, "admin@example.test");
  await saveContentCore(sql, edited, "admin@example.test");
  const { versions } = await getContentForEditCore(sql);
  const seeds = versions.filter((v) => v.created_by === "seed");
  assert.equal(seeds.length, 1);
  await restoreContentVersionCore(sql, seeds[0].id, "admin@example.test");
  assert.deepEqual(await getLatestContent(sql), defaultContent);
});

test("an invalid save is rejected and stores nothing", async () => {
  const { sql } = await createTestDb();
  const broken = structuredClone(defaultContent);
  broken.en.items.reverse();
  await assert.rejects(saveContentCore(sql, broken, "admin@example.test"));
  assert.equal((await getContentForEditCore(sql)).versions.length, 0);
});

test("restore copies the old version as the new latest row", async () => {
  const { sql } = await createTestDb();
  const first = await saveContentCore(sql, defaultContent, "admin@example.test");
  const edited = structuredClone(defaultContent);
  edited.ku.statement = "دەقێکی نوێ";
  await saveContentCore(sql, edited, "admin@example.test");

  const restored = await restoreContentVersionCore(sql, first.id, "other@example.test");
  assert.equal(restored.ok, true);
  assert.deepEqual(await getLatestContent(sql), defaultContent);
  const { versions } = await getContentForEditCore(sql);
  assert.equal(versions.length, 3);
  assert.equal(versions[0].created_by, "other@example.test");
  assert.deepEqual(await restoreContentVersionCore(sql, 9999, "admin@example.test"), { ok: false });
});
