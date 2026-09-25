import { expect, test } from "@playwright/test";
import { adminApi, row, uniqueIsbn } from "./support/api.js";

async function vendorByName(request, name) {
  const api = await adminApi(request);
  const [vendor] = (await api.get(`/inventory/vendors/?search=${encodeURIComponent(name)}`)).results;
  return vendor;
}

test("sidebar filters map to categories_supplied and is_blocked", async ({ page }) => {
  await page.goto("/admin/vendors");
  const penguin = row(page, "Penguin Distributors");
  await expect(penguin).toContainText("22AAAAA0000A1Z5");
  await expect(penguin).toContainText("Fiction, Non-Fiction");

  await page.goto("/admin/vendors/printing");
  await expect(row(page, "E2E Printworks")).toBeVisible();
  await expect(row(page, "E2E Bindery")).toHaveCount(0);

  await page.goto("/admin/vendors/binding");
  await expect(row(page, "E2E Bindery")).toBeVisible();
  await expect(row(page, "E2E Printworks")).toHaveCount(0);

  await page.goto("/admin/vendors/inactive");
  await expect(row(page, "E2E Blocked Vendor")).toContainText("Blocked");
  await expect(row(page, "Penguin Distributors")).toHaveCount(0);

  await page.goto("/admin/vendors/active");
  await expect(row(page, "Penguin Distributors")).toBeVisible();
  await expect(row(page, "E2E Blocked Vendor")).toHaveCount(0);
});

test("creates a vendor, then edits it", async ({ page, request }) => {
  const name = uniqueIsbn("E2E-Vendor");
  await page.goto("/admin/vendors");
  await page.getByRole("button", { name: "Add Vendor" }).click();

  const add = page.getByRole("dialog", { name: "Add Vendor" });
  await add.getByLabel("Company Name").fill(name);
  await add.getByLabel("Vendor Name").fill("Original Contact");
  await add.getByLabel("GSTIN").fill("23AAAAA9999A1Z5");
  await add.getByLabel("Categories Supplied").fill("Fiction, Poetry");
  await add.getByRole("button", { name: "Save Vendor" }).click();
  await expect(add).toBeHidden();
  await expect(row(page, name)).toContainText("Fiction, Poetry");

  expect(await vendorByName(request, name)).toMatchObject({
    categories_supplied: ["Fiction", "Poetry"],
    is_blocked: false,
  });

  await row(page, name).getByRole("button", { name: "Edit" }).click();
  const edit = page.getByRole("dialog", { name: "Edit Vendor" });
  await expect(edit.getByLabel("Vendor Name")).toHaveValue("Original Contact");
  await edit.getByLabel("Vendor Name").fill("Updated Contact");
  await edit.getByRole("button", { name: "Save Changes" }).click();
  await expect(edit).toBeHidden();

  expect((await vendorByName(request, name)).vendor_name).toBe("Updated Contact");
});

test("blocks and unblocks from the detail dialog", async ({ page, request }) => {
  const name = uniqueIsbn("E2E-Block");
  await page.goto("/admin/vendors");
  await page.getByRole("button", { name: "Add Vendor" }).click();
  const add = page.getByRole("dialog", { name: "Add Vendor" });
  await add.getByLabel("Company Name").fill(name);
  await add.getByLabel("Vendor Name").fill("Block Contact");
  await add.getByLabel("GSTIN").fill("20AAAAA7777A1Z5");
  await add.getByRole("button", { name: "Save Vendor" }).click();
  await expect(add).toBeHidden();

  const detail = page.getByRole("dialog", { name });
  await row(page, name).click();
  await detail.getByRole("button", { name: "Block" }).click();
  await expect(detail).toBeHidden();
  await expect(row(page, name)).toContainText("Blocked");
  expect((await vendorByName(request, name)).is_blocked).toBe(true);

  await row(page, name).click();
  await detail.getByRole("button", { name: "Unblock" }).click();
  await expect(row(page, name)).toContainText("Active");
  expect((await vendorByName(request, name)).is_blocked).toBe(false);
});

test("the Dashboard's Add Vendor quick action creates a real vendor", async ({ page, request }) => {
  // Regression: after the vendor form became API-backed, this caller was
  // never given `onSaved`, and Save failed with "onSaved is not a function".
  const name = uniqueIsbn("E2E-Dash");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: "Add Vendor" }).click();

  const dialog = page.getByRole("dialog", { name: "Add Vendor" });
  await dialog.getByLabel("Company Name").fill(name);
  await dialog.getByLabel("Vendor Name").fill("Dashboard Contact");
  await dialog.getByLabel("GSTIN").fill("25AAAAA8888A1Z5");
  await dialog.getByRole("button", { name: "Save Vendor" }).click();
  await expect(dialog).toBeHidden();

  expect(await vendorByName(request, name)).toMatchObject({ vendor_name: "Dashboard Contact" });
});
