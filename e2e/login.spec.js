import { expect, test } from "@playwright/test";
import { row } from "./support/api.js";
import { ADMIN } from "./support/env.js";

// These start signed out.
test.use({ storageState: { cookies: [], origins: [] } });

async function signIn(page, password = ADMIN.password) {
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("a wrong password shows the backend's reason and stays on /login", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, "not-the-password");

  await expect(page.getByRole("alert")).toHaveText(
    "No active account found with the given credentials"
  );
  await expect(page).toHaveURL(/\/login$/);
});

test("signing in lands on the dashboard with the employee from /auth/me/", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  await signIn(page);

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  const sidebar = page.locator("aside");
  await expect(sidebar.getByText(ADMIN.name, { exact: true })).toBeVisible();
  await expect(sidebar.getByText(ADMIN.email)).toBeVisible();
});

test("a deep link survives the trip through sign-in", async ({ page }) => {
  await page.goto("/admin/inventory/low-stock");
  await expect(page).toHaveURL(/\/login$/);

  await signIn(page);

  await expect(page).toHaveURL(/\/admin\/inventory\/low-stock$/);
  await expect(page.getByRole("heading", { name: "Low Stock" })).toBeVisible();
});

test("signing out ends the session", async ({ page }) => {
  await page.goto("/login");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/admin/inventory");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("shivalik.dev.token"))).toBeNull();
});

test("an expired access token is refreshed without the user noticing", async ({ page }) => {
  await page.goto("/login");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);

  // Stand-in for the five-minute access token running out.
  await page.evaluate(() => localStorage.setItem("shivalik.dev.token", "expired.access.token"));

  const refreshes = [];
  page.on("response", (r) => {
    if (r.url().endsWith("/api/v1/auth/token/refresh/")) refreshes.push(r.status());
  });

  await page.goto("/admin/inventory");

  await expect(row(page, "E2E Outbound Title")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/inventory$/);
  // Several requests failed at once; one refresh served them all.
  expect(refreshes).toEqual([200]);
  const token = await page.evaluate(() => localStorage.getItem("shivalik.dev.token"));
  expect(token).not.toBe("expired.access.token");
});

test("a session that cannot be refreshed goes back to sign-in", async ({ page }) => {
  await page.goto("/login");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);

  await page.evaluate(() => {
    localStorage.setItem("shivalik.dev.token", "expired.access.token");
    localStorage.setItem("shivalik.dev.refresh-token", "revoked.refresh.token");
  });
  await page.goto("/admin/inventory");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in to Shivalik" })).toBeVisible();
});
