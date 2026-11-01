import { createAuthClient } from "better-auth/react";

/** Browser-side Better Auth client for the admin pages (same origin, `/api/auth`). */
export const authClient = createAuthClient();
