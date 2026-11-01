import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIp, hashIp, ipBucket } from "./ip-hash.ts";

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

test("ipBucket groups an IPv6 address by its /64 and leaves IPv4 alone", () => {
  assert.equal(ipBucket("203.0.113.7"), "203.0.113.7");
  assert.equal(ipBucket("2001:db8:1:2:aaaa::1"), "2001:db8:1:2::/64");
  assert.equal(ipBucket("2001:DB8:1:2:bbbb:cccc:dddd:eeee"), "2001:db8:1:2::/64");
  assert.equal(ipBucket("2001:db8::7"), "2001:db8:0:0::/64");
  assert.equal(ipBucket("::ffff:203.0.113.7"), "203.0.113.7");
  assert.equal(ipBucket("fe80::1%eth0"), "fe80:0:0:0::/64");
  assert.equal(ipBucket("unknown"), "unknown");
});
