import { createHmac } from "node:crypto";

/** Hex HMAC-SHA256 of the IP. The raw IP is never stored. */
export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex");
}

/** Client IP as Vercel reports it. Vercel sets both headers and overwrites client-sent values. */
export function clientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

/**
 * Rate-limit bucket for an IP: IPv4 as is, IPv6 by its /64, since one client
 * usually controls a whole /64. IPv4-mapped IPv6 counts as the IPv4 address.
 */
export function ipBucket(ip: string): string {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return mapped[1];
  if (!ip.includes(":")) return ip;
  const address = ip.split("%")[0].toLowerCase();
  const [head, tail] = address.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const zeros = tail === undefined ? [] : Array(8 - headGroups.length - tailGroups.length).fill("0");
  const groups = [...headGroups, ...zeros, ...tailGroups];
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}
