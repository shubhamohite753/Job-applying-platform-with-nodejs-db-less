"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApplyJobModal } from "@/components/ApplyJobModal";
import {
  apiGetMyApplications,
  apiListJobs,
  type Job,
  type JobsFilterOptions,
} from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

const PAGE_SIZE = 8;

function formatPosted(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterOptions, setFilterOptions] = useState<JobsFilterOptions | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchJobs = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiListJobs({
          search: search || undefined,
          location: location || undefined,
          experience: experience || undefined,
          workMode: workMode || undefined,
          page: pageNum,
          limit: PAGE_SIZE,
        });
        setJobs(data.jobs);
        setFilterOptions(data.filters);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    },
    [search, location, experience, workMode]
  );

  useEffect(() => {
    void fetchJobs(1);
  }, [fetchJobs]);

  useEffect(() => {
    if (!isLoggedIn()) {
      setAppliedJobIds(new Set());
      return;
    }
    apiGetMyApplications()
      .then(({ jobIds }) => setAppliedJobIds(new Set(jobIds)))
      .catch(() => setAppliedJobIds(new Set()));
  }, []);

  function openApplyModal(job: Job) {
    setApplyJob(job);
    setModalOpen(true);
  }

  function handleApplied(jobId: string) {
    setAppliedJobIds((prev) => new Set(prev).add(jobId));
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setSearch(draftSearch.trim());
  }

  function clearFilters() {
    setDraftSearch("");
    setSearch("");
    setLocation("");
    setExperience("");
    setWorkMode("");
  }

  function goToPage(next: number) {
    if (next < 1 || next > totalPages) return;
    void fetchJobs(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Find jobs
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {total} opening{total === 1 ? "" : "s"} · filter by role, city, experience, and work mode
          </p>
        </div>
        {!isLoggedIn() && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              href="/login"
              className="font-medium text-emerald-700 underline dark:text-emerald-400"
            >
              Sign in
            </Link>{" "}
            to save your profile and résumé.
          </p>
        )}
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 lg:col-span-2">
          Search
          <input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Title, company, skills…"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Location
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">All cities</option>
            {filterOptions?.locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Experience
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">Any</option>
            {filterOptions?.experienceLevels.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Work mode
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">Any</option>
            {filterOptions?.workModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-zinc-500">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">No jobs match your filters.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {job.title}
                  </h2>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {job.company}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {job.location} · {job.experience} · {job.workMode}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{job.skills}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {job.salary}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{formatPosted(job.postedAt)}</p>
                  {appliedJobIds.has(job.id) ? (
                    <span className="mt-3 inline-block rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openApplyModal(job)}
                      className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800"
          aria-label="Pagination"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-600"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              className={`min-w-9 rounded-lg px-2 py-1.5 text-sm font-medium ${
                p === page
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-600"
          >
            Next
          </button>
        </nav>
      )}

      <ApplyJobModal
        job={applyJob}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApplied={handleApplied}
      />
    </main>
  );
}
