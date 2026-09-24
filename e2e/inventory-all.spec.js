import { expect, test } from "@playwright/test";
import { row } from "./support/api.js";

test("lists every catalog title with stock summed across racks", async ({ page }) => {
  const apiRequests = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/v1/")) apiRequests.push(r);
  });

  await page.goto("/admin/inventory");

  const cProgramming = row(page, "The C Programming Language");
  await expect(cProgramming.getByRole("cell").nth(2)).toHaveText("50");
  await expect(cProgramming).toContainText("₹600");
  await expect(cProgramming).toContainText("North Zone Main Hub / Engineering Texts / CS-101");
  await expect(cProgramming).toContainText("In Stock");

  // In the catalog with no stock anywhere — only the catalog read shows it.
  const empty = row(page, "E2E Empty Shelf");
  await expect(empty.getByRole("cell").nth(2)).toHaveText("0");
  await expect(empty).toContainText("Out of Stock");
  await expect(empty).toContainText("Unassigned");

  await expect(row(page, "E2E Low Stock Atlas")).toContainText("Low Stock");

  // Plumbing: every call went through the proxy with the session's token.
  expect(apiRequests.length).toBeGreaterThan(0);
  for (const request of apiRequests) {
    expect(new URL(request.url()).origin).toBe(new URL(page.url()).origin);
    expect(await request.headerValue("authorization")).toMatch(/^Bearer \S+/);
  }
});

test("the details dialog breaks stock down by rack", async ({ page }) => {
  await page.goto("/admin/inventory");

  await page.getByRole("button", { name: "View Harry Potter and the Sorcerer's Stone" }).click();

  const dialog = page.getByRole("dialog", { name: "Book Details" });
  await expect(dialog).toContainText("ISBN: 978-0439708180");
  await expect(dialog).toContainText("Current Stock: 150");
  await expect(dialog.getByRole("row").filter({ hasText: "North Zone Main Hub / Fiction Wing / A1-Top" }))
    .toContainText("150");

  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).toBeHidden();
});

test("the warehouses screen is reachable and lists warehouses", async ({ page }) => {
  await page.goto("/admin/inventory");
  await page.getByRole("link", { name: "Warehouses" }).click();

  await expect(page).toHaveURL(/\/admin\/inventory\/warehouses$/);
  await expect(row(page, "North Zone Main Hub")).toBeVisible();
  await expect(row(page, "South City Reserve")).toBeVisible();
});
