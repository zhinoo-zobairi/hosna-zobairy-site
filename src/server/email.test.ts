import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { sendClinicEmail } from "./email.ts";

const row = {
  id: "00000000-0000-4000-8000-000000000001",
  created_at: new Date("2026-11-01T10:00:00Z"),
  name: "Test Patient",
  phone: "+989120000000",
  procedure: "sinus",
  preferred_day: "sat",
  note: "Mornings are hard",
  lang: "en",
};
const ENV_KEYS = ["RESEND_API_KEY", "MAIL_FROM", "CLINIC_EMAIL"];
const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const key of ENV_KEYS) delete process.env[key];
});

test("returns false without calling Resend when env is missing", async () => {
  globalThis.fetch = () => assert.fail("fetch must not be called");
  assert.equal(await sendClinicEmail(row), false);
});

test("posts a plain-text email with every field and a 5 s timeout", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.MAIL_FROM = "onboarding@resend.dev";
  process.env.CLINIC_EMAIL = "clinic@example.test";
  let call: { url: string; init: RequestInit } | undefined;
  globalThis.fetch = async (url, init) => {
    call = { url: String(url), init: init ?? {} };
    return new Response("{}", { status: 200 });
  };
  assert.equal(await sendClinicEmail(row), true);
  assert.equal(call?.url, "https://api.resend.com/emails");
  assert.equal(new Headers(call?.init.headers).get("authorization"), "Bearer re_test");
  assert.ok(call?.init.signal instanceof AbortSignal);
  const body = JSON.parse(String(call?.init.body));
  assert.equal(body.to, "clinic@example.test");
  assert.equal(body.subject, "New appointment request — Test Patient");
  for (const value of ["Test Patient", "+989120000000", "sinus", "sat", "Mornings are hard", "en", row.id]) {
    assert.ok(body.text.includes(value), `body contains ${value}`);
  }
});

test("returns false when Resend rejects the email", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.MAIL_FROM = "onboarding@resend.dev";
  process.env.CLINIC_EMAIL = "clinic@example.test";
  globalThis.fetch = async () => new Response("{}", { status: 422 });
  assert.equal(await sendClinicEmail(row), false);
});
