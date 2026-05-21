import { getToken } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return base.replace(/\/$/, "");
}

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  headline: string;
  phone: string;
  location: string;
  bio: string;
  skills: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
  resumeFileName: string | null;
  createdAt: string;
  updatedAt: string;
};

function authHeaders(): HeadersInit {
  const token = getToken();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function apiRegister(body: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ token: string; user: PublicUser }> {
  const res = await fetch(`${getApiBase()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Registration failed", res.status);
  return data;
}

export async function apiLogin(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: PublicUser }> {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Login failed", res.status);
  return data;
}

export async function apiGetProfile(): Promise<{ user: PublicUser }> {
  const res = await fetch(`${getApiBase()}/api/profile/me`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Failed to load profile", res.status);
  return data;
}

export async function apiUpdateProfile(patch: Partial<{
  fullName: string;
  headline: string;
  phone: string;
  location: string;
  bio: string;
  skills: string;
}>): Promise<{ user: PublicUser }> {
  const res = await fetch(`${getApiBase()}/api/profile/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Update failed", res.status);
  return data;
}

export async function apiUploadAvatar(file: File): Promise<{ user: PublicUser }> {
  const token = getToken();
  const form = new FormData();
  form.append("photo", file);
  const res = await fetch(`${getApiBase()}/api/profile/me/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Photo upload failed", res.status);
  return data;
}

export async function apiUploadResume(file: File): Promise<{ user: PublicUser }> {
  const token = getToken();
  const form = new FormData();
  form.append("resume", file);
  const res = await fetch(`${getApiBase()}/api/profile/me/resume`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Resume upload failed", res.status);
  return data;
}

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  workMode: string;
  salary: string;
  skills: string;
  postedAt: string;
};

export type JobsFilterOptions = {
  locations: string[];
  experienceLevels: string[];
  workModes: string[];
};

export type JobsListResponse = {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: JobsFilterOptions;
};

export type JobsQuery = {
  search?: string;
  location?: string;
  experience?: string;
  workMode?: string;
  page?: number;
  limit?: number;
};

export async function apiListJobs(query: JobsQuery = {}): Promise<JobsListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.location) params.set("location", query.location);
  if (query.experience) params.set("experience", query.experience);
  if (query.workMode) params.set("workMode", query.workMode);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  const res = await fetch(`${getApiBase()}/api/jobs${qs ? `?${qs}` : ""}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Failed to load jobs", res.status);
  return data;
}

export type JobApplication = {
  id: string;
  jobId: string;
  resumeSource: "profile" | "upload";
  resumeFileName: string | null;
  resumeUrl: string | null;
  appliedAt: string;
};

export async function apiGetMyApplications(): Promise<{ jobIds: string[] }> {
  const res = await fetch(`${getApiBase()}/api/applications/me`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Failed to load applications", res.status);
  return data;
}

export async function apiApplyToJob(
  jobId: string,
  options: { useProfileResume: boolean; resume?: File }
): Promise<{ application: JobApplication }> {
  const token = getToken();
  const form = new FormData();
  form.append("useProfileResume", String(options.useProfileResume));
  if (options.resume) form.append("resume", options.resume);

  const res = await fetch(`${getApiBase()}/api/jobs/${encodeURIComponent(jobId)}/apply`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Application failed", res.status);
  return data;
}

export function fileUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${getApiBase()}${path}`;
}
