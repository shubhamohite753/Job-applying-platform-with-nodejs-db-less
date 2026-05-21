import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

export function loadUsers() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users }, null, 2), "utf8");
}

export function findUserByEmail(email) {
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) ?? null;
}

export function findUserById(id) {
  const users = loadUsers();
  return users.find((u) => u.id === id) ?? null;
}

export function createUser(user) {
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(id, patch) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch, updatedAt: new Date().toISOString() };
  saveUsers(users);
  return users[idx];
}
