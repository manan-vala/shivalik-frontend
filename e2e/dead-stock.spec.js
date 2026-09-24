import { expect, test } from "@playwright/test";

test("lists the title whose dead-stock window has passed", async ({ page }) => {
  await page.goto("/admin/inventory-map/dead-stock");

  await expect(page.getByRole("heading", { name: "Dead Stock", exact: true })).toBeVisible();
  const dead = page.locator("tbody tr", { hasText: "E2E Dead Stock Title" });
  await expect(dead).toContainText("E2E-DEAD-0001");
  await expect(dead).toContainText("North Zone Main Hub / Arts & Humanities / AH-101");
  await expect(dead).toContainText("12");
  await expect(dead).toContainText("Dead Stock");

  // Fresh stock (seeded/received moments ago, well under the 90-day default)
  // never shows up here.
  await expect(page.locator("tbody tr", { hasText: "Harry Potter" })).toHaveCount(0);
});

test("search narrows the dead-stock table", async ({ page }) => {
  await page.goto("/admin/inventory-map/dead-stock");
  await expect(page.locator("tbody tr", { hasText: "E2E Dead Stock Title" })).toBeVisible();

  await page.getByPlaceholder("Search dead stock...").fill("no such title anywhere");
  await expect(page.getByText("No dead stock matches this search.")).toBeVisible();

  await page.getByPlaceholder("Search dead stock...").fill("E2E-DEAD-0001");
  await expect(page.locator("tbody tr", { hasText: "E2E Dead Stock Title" })).toBeVisible();
});
