/**
 * Better Auth for the admin area (server-only). Email and password, no public sign-up.
 * Admins are created with `scripts/create-admin.mjs` (production) or the dev admin below.
 *
 * Database: Postgres through a `pg` Pool when DATABASE_URL is set, else the shared
 * in-memory PGlite from `src/lib/db.ts` through a Kysely dialect. Tables: migrations/0001_auth.sql.
 */
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";
import { dbSource, getPglite } from "../db";
import { pgliteDialect } from "./pglite-dialect";
import { appSecret } from "./secret";

const database =
  dbSource === "neon"
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

export const auth = betterAuth({
  secret: appSecret(),
  database,
  emailAndPassword: { enabled: true, disableSignUp: true },
  // Enabled in dev too, so the login limit can be tested locally.
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: { "/sign-in/email": { window: 900, max: 5 } },
  },
  // Bridges Better Auth's Set-Cookie into TanStack Start responses. Must stay last.
  plugins: [tanstackStartCookies()],
});
