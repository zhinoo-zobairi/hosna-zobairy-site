/**
 * Local dev only (no DATABASE_URL): the in-memory PGlite resets on every restart and a
 * separate script cannot reach it, so the dev server creates its own admin.
 * The password comes from DEV_ADMIN_PASSWORD, else from `.dev-admin.txt` (gitignored),
 * which is generated once and reused across restarts. It is never logged.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { auth as Auth } from "./server";

export const DEV_ADMIN_EMAIL = "admin@example.test";
const PASSWORD_FILE = ".dev-admin.txt";

export async function ensureDevAdmin(auth: typeof Auth): Promise<void> {
  // Never in a deployed or Postgres-backed environment, whoever calls this.
  if (!import.meta.env.DEV || process.env.DATABASE_URL?.trim()) return;
  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(DEV_ADMIN_EMAIL)) return;

  const fromEnv = process.env.DEV_ADMIN_PASSWORD?.trim();
  const password = fromEnv || filePassword();
  // Same rows Better Auth's own email sign-up writes.
  const user = await ctx.internalAdapter.createUser({
    email: DEV_ADMIN_EMAIL,
    name: "Dev admin",
    emailVerified: false,
  });
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  const where = fromEnv ? "DEV_ADMIN_PASSWORD" : PASSWORD_FILE;
  console.info(`[auth] Created dev admin ${DEV_ADMIN_EMAIL}. Password: see ${where}.`);
}

function filePassword(): string {
  const path = join(process.cwd(), PASSWORD_FILE);
  if (existsSync(path)) {
    const saved = readFileSync(path, "utf8").trim();
    if (saved) return saved;
  }
  const password = randomBytes(18).toString("base64url");
  writeFileSync(path, `${password}\n`, { mode: 0o600 });
  return password;
}
