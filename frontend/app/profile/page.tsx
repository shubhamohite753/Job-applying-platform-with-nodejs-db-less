"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  apiGetProfile,
  apiUpdateProfile,
  apiUploadAvatar,
  apiUploadResume,
  ApiError,
  fileUrl,
  type PublicUser,
} from "@/lib/api";
import { clearSession, getToken, updateStoredUser } from "@/lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  const load = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const { user: u } = await apiGetProfile();
      setUser(u);
      updateStoredUser(u);
      setFullName(u.fullName);
      setHeadline(u.headline);
      setPhone(u.phone);
      setLocation(u.location);
      setBio(u.bio);
      setSkills(u.skills);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) clearSession();
      setError(e instanceof Error ? e.message : "Failed to load profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    setError(null);
    try {
      const { user: u } = await apiUpdateProfile({
        fullName,
        headline,
        phone,
        location,
        bio,
        skills,
      });
      setUser(u);
      updateStoredUser(u);
      setSavedMsg("Profile saved.");
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const { user: u } = await apiUploadAvatar(file);
      setUser(u);
      updateStoredUser(u);
      setSavedMsg("Photo updated.");
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function onResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const { user: u } = await apiUploadResume(file);
      setUser(u);
      updateStoredUser(u);
      setSavedMsg("Résumé uploaded.");
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function logout() {
    clearSession();
    setUser(null);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto flex max-w-3xl flex-1 flex-col px-4 py-16">
        <p className="text-zinc-600 dark:text-zinc-400">Loading profile…</p>
      </main>
    );
  }

  if (!getToken() || !user) {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Sign in required
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Register or sign in to manage your profile, photo, and résumé.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Register
          </Link>
        </div>
        {error && (
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        )}
      </main>
    );
  }

  const avatarSrc = fileUrl(user.avatarUrl);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            My profile
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="self-start rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Sign out
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          {savedMsg}
        </div>
      )}

      <section className="grid gap-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Profile"
                fill
                className="object-cover"
                sizes="160px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                No photo
              </div>
            )}
          </div>
          <label className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
            Upload photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={onAvatarChange}
            />
          </label>
          <p className="text-center text-xs text-zinc-500">JPEG, PNG, GIF, WebP · max 2&nbsp;MB</p>
        </div>

        <form onSubmit={saveDetails} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Headline
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior full-stack engineer · 8 years"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, country"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Professional summary
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Key skills
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
              placeholder="Comma or line separated: React, Node.js, SQL…"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-fit rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Save profile details
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Résumé / CV
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          PDF or Word (.doc, .docx) · max 5&nbsp;MB
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Upload résumé
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={onResumeChange}
            />
          </label>
          {user.resumeUrl && user.resumeFileName && (
            <a
              href={fileUrl(user.resumeUrl) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400"
            >
              Download {user.resumeFileName}
            </a>
          )}
          {!user.resumeUrl && (
            <span className="text-sm text-zinc-500">No file uploaded yet.</span>
          )}
        </div>
      </section>
    </main>
  );
}
