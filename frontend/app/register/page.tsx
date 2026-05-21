"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRegister } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await apiRegister({ email, password, fullName });
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
        Create account
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-emerald-700 underline dark:text-emerald-400">
          Sign in
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Full name
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
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
            autoComplete="new-password"
            required
            minLength={6}
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
          {loading ? "Creating…" : "Register"}
        </button>
      </form>
    </main>
  );
}
