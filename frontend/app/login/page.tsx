"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiLogin } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await apiLogin({ email, password });
      setSession(token, user);
      router.push("/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        No account?{" "}
        <Link href="/register" className="font-medium text-emerald-700 underline dark:text-emerald-400">
          Register
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
