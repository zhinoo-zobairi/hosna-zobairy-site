/**
 * The app secret: signs Better Auth sessions and keys the IP hash of the form rate limit.
 * Production must set BETTER_AUTH_SECRET. Dev falls back to a fixed, public value.
 */
const DEV_SECRET = "dev-only-secret-not-for-production-zobairy-site";

let warned = false;

export function appSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (secret) return secret;
  if (!import.meta.env.DEV) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  if (!warned) {
    warned = true;
    console.warn("[auth] BETTER_AUTH_SECRET is not set; using the fixed dev secret. Never do this in production.");
  }
  return DEV_SECRET;
}
