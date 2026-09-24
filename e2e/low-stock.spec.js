import { expect, test } from "@playwright/test";
import { adminApi, row } from "./support/api.js";

test("lists titles below their minimum, from stock/low-stock/", async ({ page }) => {
  await page.goto("/admin/inventory/low-stock");

  const atlas = row(page, "E2E Low Stock Atlas");
  await expect(atlas.getByRole("cell").nth(2)).toHaveText("5");
  await expect(atlas.getByRole("cell").nth(3)).toHaveText("30");
  await expect(atlas.getByRole("cell").nth(4)).toHaveText("-25");
  await expect(atlas).toContainText("Penguin Distributors");
  await expect(atlas).toContainText("Critical");

  await expect(row(page, "E2E Empty Shelf").getByRole("cell").nth(2)).toHaveText("0");

  // Healthy titles are not listed.
  await expect(row(page, "Harry Potter")).toHaveCount(0);
  await expect(row(page, "E2E Slow Seller")).toHaveCount(0);
});

test("a reorder creates a draft purchase order for that title", async ({ page, request }) => {
  await page.goto("/admin/inventory/low-stock");
  await page.getByRole("button", { name: "Create reorder for E2E Low Stock Atlas" }).click();

  const dialog = page.getByRole("dialog", { name: "Reorder Book" });
  // Defaults: the vendor that supplied it, and exactly the deficit.
  await expect(dialog.getByLabel("Vendor:")).toHaveValue(/\d+/);
  await expect(dialog.getByLabel("Vendor:").locator("option:checked")).toHaveText("Penguin Distributors");
  await expect(dialog.getByLabel("Reorder Quantity:")).toHaveValue("25");

  await dialog.getByLabel("Reorder Quantity:").fill("40");
  await dialog.getByLabel("Reorder Notes:").fill("Term two top-up");
  await dialog.getByRole("button", { name: "Submit Reorder" }).click();

  const done = page.getByRole("dialog", { name: "Reorder Created" });
  const message = done.getByRole("status");
  await expect(message).toContainText("created as a draft with Penguin Distributors");
  const orderId = (await message.textContent()).match(/#(\d+)/)[1];

  const api = await adminApi(request);
  const order = await api.get(`/inventory/purchase-orders/${orderId}/`);
  expect(order.status).toBe("DRAFT");
  expect(order.vendor_name).toBe("Penguin Distributors");
  expect(order.notes).toBe("Term two top-up");
  expect(order.lines).toHaveLength(1);
  expect(order.lines[0]).toMatchObject({
    book_title: "E2E Low Stock Atlas",
    quantity_ordered: 40,
    unit_price: "410.00",
  });
});

test("a reorder with no quantity is stopped before it reaches the API", async ({ page }) => {
  await page.goto("/admin/inventory/low-stock");
  await page.getByRole("button", { name: "Create reorder for E2E Empty Shelf" }).click();

  let posted = false;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().includes("/purchase-orders/")) posted = true;
  });

  const dialog = page.getByRole("dialog", { name: "Reorder Book" });
  await dialog.getByLabel("Reorder Quantity:").fill("0");
  await dialog.getByRole("button", { name: "Submit Reorder" }).click();

  await expect(dialog.getByRole("alert")).toHaveText(
    "Reorder quantity must be a whole number of at least 1."
  );
  expect(posted).toBe(false);
});
