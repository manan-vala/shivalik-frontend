import { expect, test } from "@playwright/test";
import { adminApi } from "./support/api.js";
import { ADMIN } from "./support/env.js";

const LOCATION = "North Zone Main Hub / Reference & General / REF-101";

async function outboundStock(request) {
  const api = await adminApi(request);
  const rows = await api.get("/inventory/books/inventory/");
  return rows.find((r) => r.isbn === "E2E-OUT-0001").curr_stock;
}

async function addOutbound(page) {
  const search = page.getByLabel("Search and add book");
  await search.fill("E2E-OUT");
  const option = page.getByRole("option").filter({ hasText: "E2E Outbound Title" });
  await expect(option).toContainText(LOCATION);
  await option.getByRole("button").click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/inventory/out-entry");
  await expect(page.getByLabel("Search and add book")).toBeEnabled();
});

test("books stock out of a rack and the balance drops", async ({ page, request }) => {
  const before = await outboundStock(request);
  await expect(page.getByText(`Recorded by ${ADMIN.name}`)).toBeVisible();

  await addOutbound(page);
  await page.getByLabel("Out quantity for E2E Outbound Title").fill("12");
  await page.getByRole("button", { name: "Complete OUT Entry" }).click();

  await expect(page.getByRole("status")).toHaveText("Booked out 12 units across 1 line(s).");
  expect(await outboundStock(request)).toBe(before - 12);

  // The screen reloads the ledger: the new balance is what search offers.
  await page.getByLabel("Search and add book").fill("E2E-OUT");
  await expect(page.getByRole("option").filter({ hasText: "E2E Outbound Title" }))
    .toContainText(`${before - 12} available`);
});

test("taking out more than the rack holds is stopped in the form", async ({ page, request }) => {
  const before = await outboundStock(request);

  await addOutbound(page);
  await page.getByLabel("Out quantity for E2E Outbound Title").fill(String(before + 1));
  await page.getByRole("button", { name: "Complete OUT Entry" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    `E2E Outbound Title: only ${before} available on ${LOCATION}.`
  );
  expect(await outboundStock(request)).toBe(before);
});

test("search only offers books that are on a rack", async ({ page }) => {
  await page.getByLabel("Search and add book").fill("E2E Empty Shelf");
  await expect(page.getByRole("listbox")).toContainText("No stocked book matches.");
});
