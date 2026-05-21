# Job seeker profile POC (Node.js + Next.js)

Monorepo-style layout: **Express** API for auth, profile JSON storage, and file uploads; **Next.js** (App Router) UI similar to a job portal profile (photo + résumé).

## Prerequisites

- Node.js 20+ recommended

## Quick start

1. **Backend environment**

   ```bash
   cd backend
   copy .env.example .env
   ```

   On Windows PowerShell you can use `Copy-Item .env.example .env` if `.env` is not already present. Adjust `JWT_SECRET` for anything beyond local demo.

2. **Frontend environment**

   ```bash
   cd frontend
   copy .env.example .env.local
   ```

   Set `NEXT_PUBLIC_API_URL` to the API origin (default `http://localhost:4000`).

3. **Install and run** (two terminals):

   ```bash
   cd backend && npm install && npm run dev
   ```

   ```bash
   cd frontend && npm install && npm run dev
   ```

   Or from the repo root after `npm install`:

   ```bash
   npm run dev
   ```

4. Open the URL shown by Next.js (often [http://localhost:3000](http://localhost:3000); if port 3000 is busy it may use **3001**, **3002**, etc.). **Register** or **Sign in** — you land on **Jobs** with filters and pagination. Use **My profile** for photo and résumé uploads.

   If you see **CORS error** or **Failed to fetch** on register, confirm the API is running on port 4000 and restart the backend after pulling latest changes — development CORS allows any `localhost` / `127.0.0.1` port automatically.

## API (port 4000)

| Method | Path | Description |
|--------|------|----------------|
| `POST` | `/api/auth/register` | Body: `{ email, password, fullName? }` → JWT + user |
| `POST` | `/api/auth/login` | Body: `{ email, password }` |
| `GET` | `/api/profile/me` | `Authorization: Bearer <token>` |
| `PUT` | `/api/profile/me` | JSON partial update: `fullName`, `headline`, `phone`, `location`, `bio`, `skills` |
| `POST` | `/api/profile/me/avatar` | Multipart field `photo` (image, max 2 MB) |
| `POST` | `/api/profile/me/resume` | Multipart field `resume` (PDF/Word, max 5 MB) |
| `GET` | `/api/jobs` | Query: `search`, `location`, `experience`, `workMode`, `page`, `limit` → paginated job list |

Uploaded files are served under `/files/avatars/...` and `/files/resumes/...`.

User records live in `backend/data/users.json` (created on first run). This is suitable for a POC only; production would use a real database and hardened auth (httpOnly cookies, refresh tokens, rate limits, virus scanning for uploads, etc.).

## Project layout

- `backend/` — Express, `multer`, `bcryptjs`, `jsonwebtoken`, JSON file store
- `frontend/` — Next.js 16, Tailwind, client-side token in `localStorage` (demo only)

`create-next-app` may have created a nested Git repo under `frontend/`. For a single repository, remove `frontend/.git` and initialize Git at the root if you prefer.
