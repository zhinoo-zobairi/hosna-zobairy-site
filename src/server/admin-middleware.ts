import { createMiddleware, createServerFn } from "@tanstack/react-start";

export const UNAUTHORIZED = "Unauthorized";

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
 * Throws an Error (not a Response): Start then answers with the 401 status set here and the
 * client call rejects, instead of resolving with a raw Response.
 */
export const adminMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const adminEmail = await readAdminEmail();
  if (!adminEmail) {
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    setResponseStatus(401);
    throw new Error(UNAUTHORIZED);
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
