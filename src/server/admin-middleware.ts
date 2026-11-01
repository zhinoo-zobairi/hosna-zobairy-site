import { createMiddleware, createServerFn } from "@tanstack/react-start";

/** Signed-in admin's email from the Better Auth session cookie, or null. Marks the response no-store. */
async function readAdminEmail(): Promise<string | null> {
  // Dynamic imports keep server-only modules out of the client bundle.
  const { getRequestHeaders, setResponseHeader } = await import("@tanstack/react-start/server");
  const { auth, authReady } = await import("@/lib/auth/server");
  setResponseHeader("Cache-Control", "no-store");
  await authReady;
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  return session?.user.email ?? null;
}

/**
 * For admin server functions: 401 without a session, else adds `context.adminEmail`.
 * Every user is an admin: sign-up is disabled, users come only from scripts/create-admin.mjs.
 */
export const adminMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const adminEmail = await readAdminEmail();
  if (!adminEmail) {
    throw new Response("Unauthorized", {
      status: 401,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }
  return next({ context: { adminEmail } });
});

/** For the admin route guard: never throws, returns null when signed out. */
export const getAdminSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ email: string } | null> => {
    const email = await readAdminEmail();
    return email ? { email } : null;
  },
);
