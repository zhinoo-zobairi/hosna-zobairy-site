import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { sendClinicEmail } from "./email.ts";

const ENV_KEYS = ["RESEND_API_KEY", "MAIL_FROM", "CLINIC_EMAIL", "BETTER_AUTH_URL"];
const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const key of ENV_KEYS) delete process.env[key];
});

test("returns false without calling Resend when env is missing", async () => {
  globalThis.fetch = () => assert.fail("fetch must not be called");
  assert.equal(await sendClinicEmail(), false);
});

test("posts a ping with the admin link, no patient data, and a 5 s timeout", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.MAIL_FROM = "onboarding@resend.dev";
  process.env.CLINIC_EMAIL = "clinic@example.test";
  process.env.BETTER_AUTH_URL = "https://hosnazobairy.com/";
  let call: { url: string; init: RequestInit } | undefined;
  globalThis.fetch = async (url, init) => {
    call = { url: String(url), init: init ?? {} };
    return new Response("{}", { status: 200 });
  };
  assert.equal(await sendClinicEmail(), true);
  assert.equal(call?.url, "https://api.resend.com/emails");
  assert.equal(new Headers(call?.init.headers).get("authorization"), "Bearer re_test");
  assert.ok(call?.init.signal instanceof AbortSignal);
  const body = JSON.parse(String(call?.init.body));
  assert.equal(body.to, "clinic@example.test");
  assert.equal(body.subject, "New appointment request");
  assert.ok(body.text.includes("https://hosnazobairy.com/admin"));
});

test("returns false when Resend rejects the email", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.MAIL_FROM = "onboarding@resend.dev";
  process.env.CLINIC_EMAIL = "clinic@example.test";
  globalThis.fetch = async () => new Response("{}", { status: 422 });
  assert.equal(await sendClinicEmail(), false);
});
