import { useState, type FormEvent } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { getAdminSession } from "@/server/admin-middleware";
import { inputClass, primaryButtonClass } from "./-ui";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    if (await getAdminSession()) throw redirect({ to: "/admin" });
  },
  component: Login,
});

function errorText(status: number): string {
  if (status === 429) return "Too many sign-in attempts. Wait 15 minutes, then try again.";
  if (status === 401) return "Wrong email or password.";
  return "Sign-in failed. Try again.";
}

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      setError(errorText(result.error.status));
      return;
    }
    await router.navigate({ to: "/admin" });
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="font-display text-3xl">Admin sign-in</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
