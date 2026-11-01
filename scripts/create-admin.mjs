#!/usr/bin/env node
/**
 * Creates an admin who can sign in at /admin (production: DATABASE_URL is required).
 *
 *   DATABASE_URL=postgres://... node scripts/create-admin.mjs <email> <name>
 *
 * The password is read from a hidden prompt, never from argv (argv lands in shell history).
 * Public sign-up is disabled, so this inserts the same two rows Better Auth's email sign-up
 * writes: a "user" row and a "credential" account row whose password is hashed with
 * Better Auth's own `hashPassword` (scrypt). Every user is an admin.
 */
import { pathToFileURL } from "node:url";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

const MIN_PASSWORD = 12;
const MAX_PASSWORD = 128; // Better Auth's default maxPasswordLength

/** @typedef {(text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>} Query */

/**
 * Inserts the user and its credential account in one transaction.
 * `query(text, params)` must run on a single connection.
 * @param {Query} query
 * @param {{ email: string, name: string, password: string }} admin
 * @returns {Promise<{ id: string, email: string }>}
 */
export async function createAdmin(query, { email, name, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = await hashPassword(password);
  const userId = generateId();
  const now = new Date();
  await query("begin");
  try {
    const existing = await query('select id from "user" where email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) throw new Error(`A user with the email ${normalizedEmail} already exists.`);
    await query(
      'insert into "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt") values ($1, $2, $3, false, null, $4, $4)',
      [userId, name.trim(), normalizedEmail, now],
    );
    await query(
      'insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") values ($1, $2, \'credential\', $2, $3, $4, $4)',
      [generateId(), userId, hash, now],
    );
    await query("commit");
  } catch (err) {
    await query("rollback");
    throw err;
  }
  return { id: userId, email: normalizedEmail };
}

/**
 * Reads a line from the terminal without echoing it.
 * @param {string} question
 * @returns {Promise<string>}
 */
function promptHidden(question) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      reject(new Error("Run this in a terminal: the password is read from a hidden prompt."));
      return;
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    let value = "";
    /** @param {Error} [error] */
    const finish = (error) => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    /** @param {string} chunk */
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u0003") return finish(new Error("Cancelled."));
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const [email, ...nameParts] = process.argv.slice(2);
  const name = nameParts.join(" ");
  if (!email || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Usage: node scripts/create-admin.mjs <email> <name>");
  }
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is not set. Point it at the production database.");

  const password = await promptHidden(`Password for ${email} (${MIN_PASSWORD}+ characters): `);
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    throw new Error(`The password must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.`);
  }
  if ((await promptHidden("Repeat the password: ")) !== password) {
    throw new Error("The passwords do not match.");
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    /** @type {Query} */
    const query = (text, params) => client.query(text, params);
    const admin = await createAdmin(query, { email, name, password });
    console.log(`Created admin ${admin.email}. They can sign in at /admin/login.`);
  } finally {
    await client.end();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
