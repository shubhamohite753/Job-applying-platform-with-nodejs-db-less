import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
} from "./lib/store.js";
import { listJobs, findJobById } from "./lib/jobs.js";
import {
  findApplication,
  getAppliedJobIds,
  createApplication,
  publicApplication,
  newApplicationId,
} from "./lib/applications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** Allow Next.js dev on any localhost port (3000, 3002, etc.). */
function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  if (!IS_PRODUCTION && isLocalDevOrigin(origin)) {
    return callback(null, true);
  }
  if (CLIENT_ORIGINS.includes(origin)) {
    return callback(null, true);
  }
  callback(new Error(`CORS blocked origin: ${origin}`));
}

const UPLOAD_ROOT = path.join(__dirname, "uploads");
const AVATAR_DIR = path.join(UPLOAD_ROOT, "avatars");
const RESUME_DIR = path.join(UPLOAD_ROOT, "resumes");
const APPLICATION_RESUME_DIR = path.join(UPLOAD_ROOT, "applications");

[UPLOAD_ROOT, AVATAR_DIR, RESUME_DIR, APPLICATION_RESUME_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName ?? "",
    headline: u.headline ?? "",
    phone: u.phone ?? "",
    location: u.location ?? "",
    bio: u.bio ?? "",
    skills: u.skills ?? "",
    avatarUrl: u.avatarFile
      ? `/files/avatars/${encodeURIComponent(u.avatarFile)}`
      : null,
    resumeUrl: u.resumeFile
      ? `/files/resumes/${encodeURIComponent(u.resumeFile)}`
      : null,
    resumeFileName: u.resumeOriginalName ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuidv4()}${ext.toLowerCase()}`);
  },
});

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RESUME_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `${uuidv4()}${ext.toLowerCase()}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new Error("Only JPEG, PNG, GIF, or WebP images"));
    cb(null, true);
  },
});

const resumeFileFilter = (_req, file, cb) => {
  const allowed =
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "application/msword";
  if (!allowed) return cb(new Error("Only PDF or Word documents"));
  cb(null, true);
};

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: resumeFileFilter,
});

const applicationResumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, APPLICATION_RESUME_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `${uuidv4()}${ext.toLowerCase()}`);
  },
});

const uploadApplicationResume = multer({
  storage: applicationResumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: resumeFileFilter,
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, fullName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const user = {
    id: uuidv4(),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    fullName: String(fullName || "").trim(),
    headline: "",
    phone: "",
    location: "",
    bio: "",
    skills: "",
    avatarFile: null,
    resumeFile: null,
    resumeOriginalName: null,
    createdAt: now,
    updatedAt: now,
  };
  createUser(user);
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return res.status(201).json({ token, user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, user: publicUser(user) });
});

app.get("/api/jobs", (req, res) => {
  const result = listJobs(req.query);
  return res.json(result);
});

app.get("/api/applications/me", authMiddleware, (req, res) => {
  return res.json({ jobIds: getAppliedJobIds(req.userId) });
});

app.post(
  "/api/jobs/:jobId/apply",
  authMiddleware,
  (req, res, next) => {
    uploadApplicationResume.single("resume")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || "Upload failed" });
      next();
    });
  },
  (req, res) => {
    const { jobId } = req.params;
    const job = findJobById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (findApplication(req.userId, jobId)) {
      return res.status(409).json({ error: "You have already applied to this job" });
    }

    const user = findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const useProfileResume =
      req.body?.useProfileResume === true ||
      req.body?.useProfileResume === "true";

    let resumeFile = null;
    let resumeOriginalName = null;
    let resumeSource = null;

    if (req.file) {
      resumeFile = req.file.filename;
      resumeOriginalName = req.file.originalname;
      resumeSource = "upload";
    } else if (useProfileResume) {
      if (!user.resumeFile) {
        return res.status(400).json({
          error: "No résumé on your profile. Upload one or attach a file for this application.",
        });
      }
      resumeFile = user.resumeFile;
      resumeOriginalName = user.resumeOriginalName || user.resumeFile;
      resumeSource = "profile";
    } else {
      return res.status(400).json({
        error: "Choose profile résumé (useProfileResume) or upload a résumé file",
      });
    }

    const application = createApplication({
      id: newApplicationId(),
      userId: req.userId,
      jobId,
      jobTitle: job.title,
      company: job.company,
      resumeSource,
      resumeFile,
      resumeOriginalName,
      appliedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      application: publicApplication(application),
    });
  }
);

app.get("/api/profile/me", authMiddleware, (req, res) => {
  const user = findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: publicUser(user) });
});

app.put("/api/profile/me", authMiddleware, (req, res) => {
  const user = findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { fullName, headline, phone, location, bio, skills } = req.body || {};
  const updated = updateUser(req.userId, {
    ...(fullName !== undefined && { fullName: String(fullName).trim() }),
    ...(headline !== undefined && { headline: String(headline).trim() }),
    ...(phone !== undefined && { phone: String(phone).trim() }),
    ...(location !== undefined && { location: String(location).trim() }),
    ...(bio !== undefined && { bio: String(bio) }),
    ...(skills !== undefined && { skills: String(skills) }),
  });
  return res.json({ user: publicUser(updated) });
});

app.post(
  "/api/profile/me/avatar",
  authMiddleware,
  (req, res, next) => {
    uploadAvatar.single("photo")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || "Upload failed" });
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded (field name: photo)" });
    }
    const user = findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.avatarFile) {
      const oldPath = path.join(AVATAR_DIR, user.avatarFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const updated = updateUser(req.userId, { avatarFile: req.file.filename });
    return res.json({ user: publicUser(updated) });
  }
);

app.post(
  "/api/profile/me/resume",
  authMiddleware,
  (req, res, next) => {
    uploadResume.single("resume")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || "Upload failed" });
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded (field name: resume)" });
    }
    const user = findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.resumeFile) {
      const oldPath = path.join(RESUME_DIR, user.resumeFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const updated = updateUser(req.userId, {
      resumeFile: req.file.filename,
      resumeOriginalName: req.file.originalname,
    });
    return res.json({ user: publicUser(updated) });
  }
);

app.use("/files/avatars", express.static(AVATAR_DIR));
app.use("/files/resumes", express.static(RESUME_DIR));
app.use("/files/applications", express.static(APPLICATION_RESUME_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
