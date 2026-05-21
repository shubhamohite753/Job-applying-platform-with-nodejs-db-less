import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");

function ensureApplicationsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(
      APPLICATIONS_FILE,
      JSON.stringify({ applications: [] }, null, 2),
      "utf8"
    );
  }
}

export function loadApplications() {
  ensureApplicationsFile();
  const raw = fs.readFileSync(APPLICATIONS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.applications) ? parsed.applications : [];
  } catch {
    return [];
  }
}

function saveApplications(applications) {
  ensureApplicationsFile();
  fs.writeFileSync(
    APPLICATIONS_FILE,
    JSON.stringify({ applications }, null, 2),
    "utf8"
  );
}

export function findApplication(userId, jobId) {
  return (
    loadApplications().find((a) => a.userId === userId && a.jobId === jobId) ??
    null
  );
}

export function getAppliedJobIds(userId) {
  return loadApplications()
    .filter((a) => a.userId === userId)
    .map((a) => a.jobId);
}

export function createApplication(record) {
  const applications = loadApplications();
  applications.push(record);
  saveApplications(applications);
  return record;
}

export function publicApplication(app) {
  const filesBase =
    app.resumeSource === "profile" ? "/files/resumes" : "/files/applications";
  return {
    id: app.id,
    jobId: app.jobId,
    resumeSource: app.resumeSource,
    resumeFileName: app.resumeOriginalName,
    resumeUrl: app.resumeFile
      ? `${filesBase}/${encodeURIComponent(app.resumeFile)}`
      : null,
    appliedAt: app.appliedAt,
  };
}

export function newApplicationId() {
  return uuidv4();
}
