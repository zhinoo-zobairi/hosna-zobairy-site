import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { getAdminSession, UNAUTHORIZED } from "@/server/admin-middleware";

const LOGIN_PATH = "/admin/login";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Dr. Hosna Zobairy" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  beforeLoad: async ({ location }) => {
    if (location.pathname.replace(/\/$/, "") === LOGIN_PATH) return { adminEmail: null };
    const session = await getAdminSession();
    if (!session) throw redirect({ to: LOGIN_PATH });
    return { adminEmail: session.email };
  },
  component: AdminLayout,
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink">
      <p>{errorText(error)}</p>
      <a href={LOGIN_PATH} className="mt-4 inline-block underline underline-offset-4">
        Sign in again
      </a>
    </main>
  ),
});

function errorText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message === UNAUTHORIZED ? "Your session has ended." : `Something went wrong: ${message}`;
}

const navLink = "text-muted hover:text-ink";
const activeNavLink = { className: "text-ink underline underline-offset-4" };

function AdminLayout() {
  const { adminEmail } = Route.useRouteContext();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    await router.navigate({ to: LOGIN_PATH });
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {adminEmail && (
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
            <span className="font-display text-xl">Admin</span>
            <nav className="flex gap-4 text-sm">
              <Link to="/admin" activeOptions={{ exact: true }} className={navLink} activeProps={activeNavLink}>
                Requests
              </Link>
              <Link to="/admin/content" className={navLink} activeProps={activeNavLink}>
                Content
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-4 text-sm">
              <span className="hidden text-muted sm:inline">{adminEmail}</span>
              <button type="button" onClick={signOut} className="underline underline-offset-4">
                Sign out
              </button>
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
