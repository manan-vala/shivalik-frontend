import { expect, test } from "@playwright/test";
import { row } from "./support/api.js";
import { ADMIN } from "./support/env.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/settings");
  await page.getByRole("tab", { name: "Users" }).click();
});

test("the role filter maps labels onto the backend's role values", async ({ page }) => {
  await page.getByLabel("Filter by role").selectOption("Order Manager");
  await expect(row(page, "e2e.approved@shivalik.test")).toBeVisible();
  await expect(row(page, ADMIN.email)).toHaveCount(0);

  await page.getByLabel("Filter by role").selectOption("Admin");
  await expect(row(page, ADMIN.email)).toBeVisible();
  await expect(row(page, "e2e.approved@shivalik.test")).toHaveCount(0);
});

test("an edit here shows up on the Staff screen — one resource, not two", async ({ page }) => {
  await row(page, "e2e.approved@shivalik.test").getByRole("button", { name: "Edit" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Staff Member" });
  await dialog.getByLabel("Phone").fill("+91 90000 00001");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();

  await page.goto("/admin/staff");
  await row(page, "e2e.approved@shivalik.test").click();
  await expect(page.getByRole("dialog", { name: "E2E Order Manager" })).toContainText(
    "+91 90000 00001"
  );
});
