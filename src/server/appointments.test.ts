import assert from "node:assert/strict";
import { test } from "node:test";
import type { AppointmentRow } from "./appointment-schema.ts";
import {
  deleteAppointmentCore,
  listAppointmentsCore,
  setAppointmentStatusCore,
  submitAppointmentCore,
  toAsciiDigits,
} from "./appointments-core.ts";
import { createTestDb } from "./test-db.ts";

// Resend env stays unset here, so no email is sent.
for (const key of ["RESEND_API_KEY", "MAIL_FROM", "CLINIC_EMAIL"]) delete process.env[key];

const valid = {
  name: "Test Patient",
  phone: "+98 912 000 0000",
  procedure: "sinus",
  preferredDay: "sat",
  note: "Afternoons",
  lang: "en",
};
const opts = { ip: "203.0.113.7", secret: "test-secret" };

async function rows(sql: Awaited<ReturnType<typeof createTestDb>>["sql"]) {
  return sql<AppointmentRow>`select * from appointment_requests`;
}

test("a filled honeypot returns ok and stores nothing", async () => {
  const { sql } = await createTestDb();
  const result = await submitAppointmentCore(sql, { ...valid, website: "https://spam.example" }, opts);
  assert.deepEqual(result, { ok: true });
  assert.equal((await rows(sql)).length, 0);
  const [{ count }] = await sql<{ count: number }>`select count(*)::int as count from rate_limits`;
  assert.equal(count, 0);
});

test("a bad phone returns invalid", async () => {
  const { sql } = await createTestDb();
  const result = await submitAppointmentCore(sql, { ...valid, phone: "call me" }, opts);
  assert.deepEqual(result, { ok: false, error: "invalid" });
  assert.equal((await rows(sql)).length, 0);
});

test("digits from other scripts are rejected", async () => {
  const { sql } = await createTestDb();
  for (const phone of ["０９１２３４５６７８", "०९१२३४५६७८", "\u{1D7CE}\u{1D7CF}\u{1D7D0}\u{1D7D1}\u{1D7D2}"]) {
    assert.deepEqual(await submitAppointmentCore(sql, { ...valid, phone }, opts), { ok: false, error: "invalid" });
  }
  assert.equal((await rows(sql)).length, 0);
});

test("Persian and Arabic-Indic digits are stored as ASCII", async () => {
  assert.equal(toAsciiDigits("۰۱۲۳۴۵۶۷۸۹ ٠١٢٣٤٥٦٧٨٩"), "0123456789 0123456789");
  const { sql } = await createTestDb();
  await submitAppointmentCore(sql, { ...valid, phone: "۰۹۱۲ ۱۲۳ ٤٥٦٧" }, opts);
  assert.equal((await rows(sql))[0].phone, "0912 123 4567");
});

test("a valid request is stored with email_sent = false when Resend is not configured", async () => {
  const { sql } = await createTestDb();
  assert.deepEqual(await submitAppointmentCore(sql, valid, opts), { ok: true });
  const [row] = await rows(sql);
  assert.equal(row.name, "Test Patient");
  assert.equal(row.preferred_day, "sat");
  assert.equal(row.status, "new");
  assert.equal(row.email_sent, false);
  const [limit] = await sql<{ key: string }>`select key from rate_limits`;
  assert.match(limit.key, /^appt:[0-9a-f]{64}$/);
});

test("the 6th request from one IP within an hour is rate limited", async () => {
  const { sql } = await createTestDb();
  for (let i = 0; i < 5; i += 1) assert.deepEqual(await submitAppointmentCore(sql, valid, opts), { ok: true });
  assert.deepEqual(await submitAppointmentCore(sql, valid, opts), { ok: false, error: "rate_limited" });
  assert.deepEqual(await submitAppointmentCore(sql, valid, { ...opts, ip: "198.51.100.1" }), { ok: true });
});

test("listing purges requests older than 12 months, then status and delete work", async () => {
  const { sql } = await createTestDb();
  await submitAppointmentCore(sql, valid, opts);
  await sql`insert into appointment_requests (created_at, name, phone, procedure, preferred_day, lang)
            values (now() - interval '13 months', 'Old', '00000', 'ear', 'any', 'ku')`;
  const listed = await listAppointmentsCore(sql);
  assert.deepEqual(listed.map((r) => r.name), ["Test Patient"]);

  const { id } = listed[0];
  assert.deepEqual(await setAppointmentStatusCore(sql, { id, status: "contacted" }), { ok: true });
  assert.equal((await rows(sql))[0].status, "contacted");
  assert.deepEqual(await deleteAppointmentCore(sql, { id }), { ok: true });
  assert.equal((await rows(sql)).length, 0);
});
