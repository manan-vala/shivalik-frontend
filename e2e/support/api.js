import { expect } from "@playwright/test";
import { ADMIN } from "./env.js";

/**
 * Reads the backend directly, as the e2e admin, to check what a screen
 * claimed to have saved. Goes through the Vite proxy like the app does.
 */
export async function adminApi(request) {
  const login = await request.post("/api/v1/auth/login/", {
    data: { email: ADMIN.email, password: ADMIN.password },
  });
  expect(login.ok()).toBeTruthy();
  const { access } = await login.json();

  return {
    async get(path) {
      const response = await request.get(`/api/v1${path}`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      expect(response.ok(), `GET ${path} -> ${response.status()}`).toBeTruthy();
      return response.json();
    },
  };
}

/** A table row by the text it contains. */
export function row(page, text) {
  return page.getByRole("row").filter({ hasText: text });
}

/**
 * A unique ISBN-field value, so no two tests collide. Stays within the
 * backend's 20-character limit on `Book.isbn`.
 */
export function uniqueIsbn(prefix) {
  const suffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 36 ** 2).toString(36)}`;
  return `${prefix}-${suffix}`.slice(0, 20);
}
