"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiApplyToJob,
  apiGetProfile,
  fileUrl,
  type Job,
  type PublicUser,
} from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

type ResumeChoice = "profile" | "upload";

type Props = {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onApplied: (jobId: string) => void;
};

export function ApplyJobModal({ job, open, onClose, onApplied }: Props) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [choice, setChoice] = useState<ResumeChoice>("profile");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open || !job) return;
    setError(null);
    setSuccess(false);
    setFile(null);
    setChoice("profile");

    if (!isLoggedIn()) return;

    setLoadingProfile(true);
    apiGetProfile()
      .then(({ user: u }) => {
        setUser(u);
        setChoice(u.resumeUrl ? "profile" : "upload");
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load profile")
      )
      .finally(() => setLoadingProfile(false));
  }, [open, job]);

  if (!open || !job) return null;

  const hasProfileResume = Boolean(user?.resumeUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!job || !isLoggedIn()) return;
    setError(null);

    if (choice === "profile" && !hasProfileResume) {
      setError(
        "Upload a résumé on your profile first, or choose a different file below."
      );
      return;
    }
    if (choice === "upload" && !file) {
      setError("Please select a résumé file to upload.");
      return;
    }

    setSubmitting(true);
    try {
      await apiApplyToJob(job.id, {
        useProfileResume: choice === "profile",
        resume: choice === "upload" ? file ?? undefined : undefined,
      });
      setSuccess(true);
      onApplied(job.id);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="apply-modal-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
            >
              Apply for this job
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {job.title} · {job.company}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {!isLoggedIn() ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to apply and attach your résumé.
            </p>
            <Link
              href="/login"
              className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Sign in
            </Link>
          </div>
        ) : success ? (
          <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100">
            Application submitted successfully.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {loadingProfile ? (
              <p className="text-sm text-zinc-500">Loading your profile…</p>
            ) : (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Choose résumé
                </legend>

                <label
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                    choice === "profile"
                      ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/30"
                      : "border-zinc-200 dark:border-zinc-700"
                  } ${!hasProfileResume ? "opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="resumeChoice"
                    value="profile"
                    checked={choice === "profile"}
                    disabled={!hasProfileResume}
                    onChange={() => setChoice("profile")}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Use profile résumé
                    </p>
                    {hasProfileResume ? (
                      <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-400">
                        {user?.resumeFileName}
                        {user?.resumeUrl && (
                          <>
                            {" · "}
                            <a
                              href={fileUrl(user.resumeUrl) ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 underline dark:text-emerald-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Preview
                            </a>
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-500">
                        No résumé on profile.{" "}
                        <Link href="/profile" className="underline">
                          Upload one
                        </Link>{" "}
                        or pick a file below.
                      </p>
                    )}
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                    choice === "upload"
                      ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/30"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="resumeChoice"
                    value="upload"
                    checked={choice === "upload"}
                    onChange={() => setChoice("upload")}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Upload a different résumé
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      PDF or Word · max 5 MB · only for this application
                    </p>
                    {choice === "upload" && (
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="mt-3 block w-full text-xs text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    )}
                    {file && (
                      <p className="mt-2 truncate text-xs text-zinc-600 dark:text-zinc-400">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </label>
              </fieldset>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loadingProfile}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
