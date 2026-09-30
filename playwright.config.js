import { defineConfig, devices } from "@playwright/test";
import {
  AUTH_STATE,
  BACKEND_URL,
  FRONTEND_PORT,
  FRONTEND_URL,
} from "./e2e/support/env.js";

/**
 * End-to-end suite: the real React app against a real Django + database.
 *
 *   npm run test:e2e
 *
 * Playwright starts both servers itself — Django on :8010 against a
 * throwaway `shivalik_e2e` database that is flushed and reseeded every run,
 * and Vite on :5180 proxying `/api` to it (prefix stripped, as nginx does). Needs the backend checked out
 * next to this repo (or E2E_BACKEND_DIR) and its database reachable.
 * See e2e/README.md.
 */
export default defineConfig({
  testDir: "./e2e",
  // One database shared by every spec: run them one at a time.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.js/ },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        storageState: AUTH_STATE,
      },
    },
  ],
  webServer: [
    {
      command: "node e2e/backend/start.mjs",
      url: `${BACKEND_URL}/api/health/`,
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "pipe",
    },
    {
      command: `npx vite --port ${FRONTEND_PORT} --strictPort`,
      url: FRONTEND_URL,
      reuseExistingServer: false,
      env: { API_PROXY_TARGET: BACKEND_URL },
    },
  ],
});
