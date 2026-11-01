import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { createAdmin } from "../../scripts/create-admin.mjs";
import { pgliteDialect } from "../lib/auth/pglite-dialect.ts";
import { createTestDb } from "./test-db.ts";

test("a script-created admin can sign in through Better Auth", async () => {
  const { pg } = await createTestDb();
  const query = (text: string, params?: unknown[]) => pg.query(text, params);
  await createAdmin(query, { email: "Owner@Example.test", name: "Owner", password: "correct horse battery" });
  await assert.rejects(
    createAdmin(query, { email: "owner@example.test", name: "Again", password: "correct horse battery" }),
    /already exists/,
  );

  const auth = betterAuth({
    secret: "test-secret-test-secret-test-secret",
    baseURL: "http://localhost:8095",
    database: { dialect: pgliteDialect(() => pg), type: "postgres" },
    emailAndPassword: { enabled: true, disableSignUp: true },
  });
  const result = await auth.api.signInEmail({
    body: { email: "owner@example.test", password: "correct horse battery" },
  });
  assert.equal(result.user.email, "owner@example.test");
  assert.equal(result.user.name, "Owner");
  assert.ok(result.token);
  await assert.rejects(
    auth.api.signInEmail({ body: { email: "owner@example.test", password: "wrong password!!" } }),
  );
});
