import { expect, test } from "@playwright/test";
import { row } from "./support/api.js";

test("lists the titles flagged low-selling, with their stock", async ({ page }) => {
  await page.goto("/admin/inventory/low-selling");

  const slow = row(page, "E2E Slow Seller");
  await expect(slow.getByRole("cell").nth(2)).toHaveText("40");
  await expect(slow).toContainText("North Zone Main Hub / Engineering Texts / CS-101");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByTestId("stagnant-count")).toHaveText("1");
});

test("running a campaign posts the terms and shows the backend's answer", async ({ page }) => {
  await page.goto("/admin/inventory/low-selling");
  await page.getByRole("button", { name: "Run campaign for E2E Slow Seller" }).click();

  const dialog = page.getByRole("dialog", { name: "Run Discount Campaign" });
  await dialog.getByLabel("Discount Percentage (%):").fill("30");
  await dialog.getByLabel("Campaign Duration (Days):").selectOption("14");
  await dialog.getByLabel("Internal Strategy Notes:").fill("Clear before the new edition");

  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/run-campaign/")),
    dialog.getByRole("button", { name: "Launch Campaign" }).click(),
  ]);
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON()).toEqual({
    discount_percent: 30,
    duration_days: 14,
    notes: "Clear before the new edition",
  });

  await expect(page.getByRole("dialog", { name: "Campaign Launched" }).getByRole("status"))
    .toHaveText("Campaign started for E2E Slow Seller.");
});

test("a discount outside 5–90% is refused in the form", async ({ page }) => {
  await page.goto("/admin/inventory/low-selling");
  await page.getByRole("button", { name: "Run campaign for E2E Slow Seller" }).click();

  const dialog = page.getByRole("dialog", { name: "Run Discount Campaign" });
  await dialog.getByLabel("Discount Percentage (%):").fill("95");
  await dialog.getByRole("button", { name: "Launch Campaign" }).click();

  await expect(dialog.getByRole("alert")).toHaveText("Discount must be between 5% and 90%.");
});
