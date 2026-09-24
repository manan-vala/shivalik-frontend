import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * Where the e2e stack lives. Every value can be overridden from the shell.
 *
 * The suite runs its own Django on its own port and its own database, so it
 * never touches the development server on :8000 or the data in it.
 */

const FRONTEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const BACKEND_DIR = path.resolve(
  FRONTEND_ROOT,
  process.env.E2E_BACKEND_DIR || "../backend-shivalik"
);
export const PYTHON = process.env.E2E_PYTHON || "python";

export const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT || 8010);
export const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT || 5180);
export const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
export const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

/** Postgres database (or SQLite file) the suite flushes and reseeds on every run. */
export const E2E_DB_NAME = process.env.E2E_DB_NAME || "shivalik_e2e";

export const ADMIN = {
  email: "e2e.admin@shivalik.test",
  password: "E2e-Warehouse-2026!",
  name: "E2E Admin",
};

export const AUTH_STATE = path.join(FRONTEND_ROOT, "e2e/.auth/admin.json");
