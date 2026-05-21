"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/api";
import { AUTH_CHANGED_EVENT } from "@/lib/auth-events";
import { apiGetProfile } from "@/lib/api";
import {
  clearSession,
  getStoredUser,
  isLoggedIn,
  updateStoredUser,
} from "@/lib/auth";

export function SiteNav() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  const syncAuth = useCallback(() => {
    const ok = isLoggedIn();
    setLoggedIn(ok);
    setUser(ok ? getStoredUser() : null);
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [syncAuth]);

  useEffect(() => {
    if (!isLoggedIn() || getStoredUser()) return;
    apiGetProfile()
      .then(({ user }) => {
        updateStoredUser(user);
        syncAuth();
      })
      .catch(() => clearSession());
  }, [syncAuth]);

  function handleSignOut() {
    clearSession();
    router.push("/login");
  }

  const displayName =
    user?.fullName?.trim() || user?.email?.split("@")[0] || "Account";

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href={loggedIn ? "/jobs" : "/"}
          className="text-lg font-semibold tracking-tight text-emerald-700 dark:text-emerald-400"
        >
          JobProfile
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium">
          {loggedIn ? (
            <>
              <span className="hidden max-w-[140px] truncate text-zinc-600 sm:inline dark:text-zinc-400">
                Hi, {displayName}
              </span>
              <Link
                href="/jobs"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
              >
                Jobs
              </Link>
              <Link
                href="/profile"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                My profile
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/jobs"
                className="rounded-lg px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Browse jobs
              </Link>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
