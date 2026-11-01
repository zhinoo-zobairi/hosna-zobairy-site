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
