import { expect, test } from "@playwright/test";
import { row } from "./support/api.js";

test("lists only titles holding stock, from stock/in-stock/", async ({ page }) => {
  await page.goto("/admin/inventory/in-stock");

  const harry = row(page, "Harry Potter and the Sorcerer's Stone");
  await expect(harry).toContainText("150");
  await expect(harry).toContainText("North Zone Main Hub / Fiction Wing / A1-Top");
  await expect(harry).toContainText("In Stock");

  // Below its minimum of 30 but still in stock.
  await expect(row(page, "E2E Low Stock Atlas")).toContainText("Low Stock");

  // No stock anywhere, so not on this screen.
  await expect(row(page, "E2E Empty Shelf")).toHaveCount(0);

  const bodyRows = page.locator("tbody tr");
  await expect(page.getByTestId("in-stock-count")).toHaveText(String(await bodyRows.count()));
});

test("search narrows the list by title or ISBN", async ({ page }) => {
  await page.goto("/admin/inventory/in-stock");
  await expect(row(page, "E2E Slow Seller")).toBeVisible();

  await page.getByLabel("Search in-stock items").fill("harry");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(row(page, "Harry Potter")).toBeVisible();

  await page.getByLabel("Search in-stock items").fill("978-0131103627");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(row(page, "The C Programming Language")).toBeVisible();
});
