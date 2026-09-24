/**
 * Starts the Django backend for the e2e suite (Playwright `webServer`).
 *
 *   1. create the e2e database if missing   (prepare_db.py)
 *   2. migrate, then flush it               (a clean slate every run)
 *   3. seed_inventory + e2e fixtures        (fixtures.py)
 *   4. runserver on the e2e port, in the foreground
 *
 * Everything runs against `E2E_DB_NAME`, never the development database:
 * `DB_NAME` / `SQLITE_NAME` are overridden in the child environment, and the
 * backend's `.env` loads with `override=False`, so these win.
 */
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { ADMIN, BACKEND_DIR, BACKEND_PORT, E2E_DB_NAME, PYTHON } from "../support/env.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

const env = {
  ...process.env,
  DB_NAME: E2E_DB_NAME,
  SQLITE_NAME: `${E2E_DB_NAME}.sqlite3`,
  DJANGO_DEBUG: "true",
  ENFORCE_IP_ALLOWLIST: "false",
  PYTHONUNBUFFERED: "1",
  E2E_ADMIN_EMAIL: ADMIN.email,
  E2E_ADMIN_PASSWORD: ADMIN.password,
  E2E_ADMIN_NAME: ADMIN.name,
};

function run(args, options = {}) {
  const result = spawnSync(PYTHON, args, { cwd: BACKEND_DIR, env, stdio: ["pipe", "inherit", "inherit"], ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`[e2e backend] failed: ${PYTHON} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`[e2e backend] ${BACKEND_DIR} -> database "${E2E_DB_NAME}"`);
run([path.join(HERE, "prepare_db.py")]);
run(["manage.py", "migrate", "--noinput", "-v", "0"]);
run(["manage.py", "flush", "--noinput", "-v", "0"]);
run(["manage.py", "seed_inventory"]);
run(["manage.py", "shell"], { input: readFileSync(path.join(HERE, "fixtures.py")) });

const server = spawn(
  PYTHON,
  ["manage.py", "runserver", `127.0.0.1:${BACKEND_PORT}`, "--noreload"],
  { cwd: BACKEND_DIR, env, stdio: "inherit" }
);
server.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}
