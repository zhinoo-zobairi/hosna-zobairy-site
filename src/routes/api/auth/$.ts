import { createFileRoute } from "@tanstack/react-router";

async function handle({ request }: { request: Request }): Promise<Response> {
  // Lazy: a missing BETTER_AUTH_SECRET in production then fails only auth, not every page.
  const { auth, authReady } = await import("@/lib/auth/server");
  await authReady;
  const response = await auth.handler(request);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: handle, POST: handle } },
});
