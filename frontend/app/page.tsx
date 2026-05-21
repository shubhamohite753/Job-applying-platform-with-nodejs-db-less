import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-10 px-4 py-16">
      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-10 shadow-sm dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          POC — Node.js + Next.js
        </p>
        <h1 className="mt-2 max-w-xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Build a job seeker profile like a Naukri-style flow
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Register, sign in, then edit your profile: headline, contact, bio,
          skills, a profile photo, and a résumé (PDF or Word). Files are stored
          by the Express API; this Next.js app is the UI.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            Create account
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Browse jobs
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Express API",
            body: "Auth with JWT, JSON user store, Multer uploads for avatar and résumé.",
          },
          {
            title: "Next.js UI",
            body: "App Router, Tailwind, client forms calling the API with your token.",
          },
          {
            title: "Run locally",
            body: "Terminal 1: npm run dev in backend/. Terminal 2: npm run dev in frontend/.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {card.body}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
