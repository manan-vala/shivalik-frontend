import { expect, test } from "@playwright/test";
import { row } from "./support/api.js";
import { ADMIN } from "./support/env.js";

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/settings");
  await page.getByRole("tab", { name: "Users" }).click();
  await expect(page.getByRole("tabpanel", { name: "Users" })).toBeVisible();
});

test("lists the same Employee resource as the Staff screen", async ({ page }) => {
  const adminRow = row(page, ADMIN.email);
  await expect(adminRow).toContainText(ADMIN.name);
  await expect(adminRow).toContainText("Admin");
  await expect(adminRow).toContainText("Approved");

  await expect(row(page, "e2e.approved@shivalik.test")).toContainText("Order Manager");
});

test("the role filter narrows the list", async ({ page }) => {
  await page.getByLabel("Filter by role").selectOption("Order Manager");
  await expect(row(page, "e2e.approved@shivalik.test")).toBeVisible();
  await expect(row(page, ADMIN.email)).toHaveCount(0);

  await page.getByLabel("Filter by role").selectOption("All Roles");
  await expect(row(page, ADMIN.email)).toBeVisible();
});

test("search matches name or email", async ({ page }) => {
  await page.getByLabel("Search users").fill("e2e.approved");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(row(page, "E2E Order Manager")).toBeVisible();
});

test("editing here uses the same StaffFormDialog and API as the Staff screen", async ({ page }) => {
  await row(page, "e2e.approved@shivalik.test").getByRole("button", { name: "Edit" }).click();

  const dialog = page.getByRole("dialog", { name: "Edit Staff Member" });
  await expect(dialog.getByLabel("Email")).toHaveValue("e2e.approved@shivalik.test");
  await dialog.getByLabel("Phone").fill("+91 90000 00001");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();

  // The change is visible from the Staff screen too — one resource, not two.
  await page.goto("/admin/staff");
  await row(page, "e2e.approved@shivalik.test").click();
  await expect(page.getByRole("dialog", { name: "E2E Order Manager" })).toContainText(
    "+91 90000 00001"
  );
});
