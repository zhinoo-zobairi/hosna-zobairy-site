import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

async function handle({ request }: { request: Request }): Promise<Response> {
  const response = await auth.handler(request);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: handle, POST: handle } },
});
