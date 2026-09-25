import { expect, test } from "@playwright/test";

test("lists stock past its title's dead-stock window, and only that", async ({ page }) => {
  await page.goto("/admin/inventory-map/dead-stock");

  const dead = page.locator("tbody tr", { hasText: "E2E Dead Stock Title" });
  await expect(dead).toContainText("North Zone Main Hub / Arts & Humanities / AH-101");
  await expect(dead).toContainText("12");

  // Everything else was stocked moments ago, well inside the 90-day default.
  await expect(page.locator("tbody tr")).toHaveCount(1);
});
