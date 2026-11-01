import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIp, hashIp } from "./ip-hash.ts";

test("the hash is stable, keyed, and never contains the raw IP", () => {
  const ip = "203.0.113.7";
  const hash = hashIp(ip, "secret-a");
  assert.equal(hash, hashIp(ip, "secret-a"));
  assert.notEqual(hash, hashIp(ip, "secret-b"));
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash.includes(ip), false);
});

test("clientIp prefers x-real-ip, then the first x-forwarded-for entry, then unknown", () => {
  const both = new Headers({ "x-real-ip": "198.51.100.1", "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
  assert.equal(clientIp(both), "198.51.100.1");
  assert.equal(clientIp(new Headers({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1" })), "203.0.113.7");
  assert.equal(clientIp(new Headers()), "unknown");
});
