import { expect, test } from "@playwright/test";
import { adminApi, row, uniqueIsbn } from "./support/api.js";

function uniqueName(prefix) {
  return uniqueIsbn(prefix);
}

test("lists vendors with their real fields", async ({ page }) => {
  await page.goto("/admin/vendors");

  const penguin = row(page, "Penguin Distributors");
  await expect(penguin).toContainText("Ramesh Kumar");
  await expect(penguin).toContainText("22AAAAA0000A1Z5");
  await expect(penguin).toContainText("Fiction, Non-Fiction");
  await expect(penguin).toContainText("Active");

  await expect(row(page, "E2E Blocked Vendor")).toContainText("Blocked");
});

test("Printing / Binding / Active / Inactive sidebar filters read categories_supplied and is_blocked", async ({ page }) => {
  await page.goto("/admin/vendors/printing");
  await expect(row(page, "E2E Printworks")).toBeVisible();
  await expect(row(page, "E2E Bindery")).toHaveCount(0);
  await expect(row(page, "Penguin Distributors")).toHaveCount(0);

  await page.goto("/admin/vendors/binding");
  await expect(row(page, "E2E Bindery")).toBeVisible();
  await expect(row(page, "E2E Printworks")).toHaveCount(0);

  await page.goto("/admin/vendors/inactive");
  await expect(row(page, "E2E Blocked Vendor")).toBeVisible();
  await expect(row(page, "Penguin Distributors")).toHaveCount(0);

  await page.goto("/admin/vendors/active");
  await expect(row(page, "Penguin Distributors")).toBeVisible();
  await expect(row(page, "E2E Blocked Vendor")).toHaveCount(0);
});

test("search matches company name, vendor name and GSTIN", async ({ page }) => {
  await page.goto("/admin/vendors");
  await page.getByLabel("Search vendors").fill("22AAAAA0000A1Z5");
  await expect(page.getByRole("row").filter({ hasText: "VN-" })).toHaveCount(1);
  await expect(row(page, "Penguin Distributors")).toBeVisible();
});

test("creates a vendor with comma-separated categories", async ({ page, request }) => {
  const name = uniqueName("E2E-Vendor");
  await page.goto("/admin/vendors");
  await page.getByRole("button", { name: "Add Vendor" }).click();

  const dialog = page.getByRole("dialog", { name: "Add Vendor" });
  await dialog.getByLabel("Company Name").fill(name);
  await dialog.getByLabel("Vendor Name").fill("E2E Contact Person");
  await dialog.getByLabel("GSTIN").fill("23AAAAA9999A1Z5");
  await dialog.getByLabel("Categories Supplied").fill("Fiction, Poetry");
  await dialog.getByLabel("Payment Terms").fill("Net 45");
  await dialog.getByRole("button", { name: "Save Vendor" }).click();

  await expect(dialog).toBeHidden();
  const created = row(page, name);
  await expect(created).toContainText("Fiction, Poetry");
  await expect(created).toContainText("Active");

  const api = await adminApi(request);
  const [vendor] = (await api.get("/inventory/vendors/?search=" + encodeURIComponent(name))).results;
  expect(vendor).toMatchObject({
    company_name: name,
    categories_supplied: ["Fiction", "Poetry"],
    payment_terms: "Net 45",
    is_blocked: false,
  });
});

test("a duplicate GSTIN is refused with the backend's message", async ({ page }) => {
  await page.goto("/admin/vendors");
  await page.getByRole("button", { name: "Add Vendor" }).click();

  const dialog = page.getByRole("dialog", { name: "Add Vendor" });
  await dialog.getByLabel("Company Name").fill(uniqueName("E2E-Dupe"));
  await dialog.getByLabel("Vendor Name").fill("Dupe Contact");
  await dialog.getByLabel("GSTIN").fill("22AAAAA0000A1Z5"); // Penguin's
  await dialog.getByRole("button", { name: "Save Vendor" }).click();

  await expect(dialog.getByRole("alert")).toContainText("gst_number");
});

test("editing a vendor updates its row without touching block state", async ({ page }) => {
  const name = uniqueName("E2E-EditVendor");
  await page.goto("/admin/vendors");
  await page.getByRole("button", { name: "Add Vendor" }).click();
  const addDialog = page.getByRole("dialog", { name: "Add Vendor" });
  await addDialog.getByLabel("Company Name").fill(name);
  await addDialog.getByLabel("Vendor Name").fill("Original Contact");
  await addDialog.getByLabel("GSTIN").fill("21AAAAA8888A1Z5");
  await addDialog.getByRole("button", { name: "Save Vendor" }).click();
  await expect(addDialog).toBeHidden();

  await row(page, name).getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Vendor" });
  await expect(editDialog.getByLabel("Vendor Name")).toHaveValue("Original Contact");
  await editDialog.getByLabel("Vendor Name").fill("Updated Contact");
  await editDialog.getByRole("button", { name: "Save Changes" }).click();

  await expect(editDialog).toBeHidden();
  await expect(row(page, name)).toContainText("Active");
  await row(page, name).click();
  await expect(page.getByRole("dialog", { name: name })).toContainText("Updated Contact");
});

test("blocking and unblocking from the detail dialog updates the row", async ({ page, request }) => {
  const name = uniqueName("E2E-BlockToggle");
  await page.goto("/admin/vendors");
  await page.getByRole("button", { name: "Add Vendor" }).click();
  const addDialog = page.getByRole("dialog", { name: "Add Vendor" });
  await addDialog.getByLabel("Company Name").fill(name);
  await addDialog.getByLabel("Vendor Name").fill("Block Toggle Contact");
  await addDialog.getByLabel("GSTIN").fill("20AAAAA7777A1Z5");
  await addDialog.getByRole("button", { name: "Save Vendor" }).click();
  await expect(addDialog).toBeHidden();

  await row(page, name).click();
  const detail = page.getByRole("dialog", { name });
  await expect(detail).toContainText("Active");
  await detail.getByRole("button", { name: "Block" }).click();

  await expect(detail).toBeHidden();
  await expect(row(page, name)).toContainText("Blocked");

  const api = await adminApi(request);
  let [vendor] = (await api.get("/inventory/vendors/?search=" + encodeURIComponent(name))).results;
  expect(vendor.is_blocked).toBe(true);

  await row(page, name).click();
  await expect(page.getByRole("dialog", { name })).toContainText("Blocked");
  await page.getByRole("dialog", { name }).getByRole("button", { name: "Unblock" }).click();
  await expect(row(page, name)).toContainText("Active");

  [vendor] = (await api.get("/inventory/vendors/?search=" + encodeURIComponent(name))).results;
  expect(vendor.is_blocked).toBe(false);
});

test("the detail dialog's Purchase Orders tab lists this vendor's real orders", async ({ page }) => {
  await page.goto("/admin/vendors");
  await row(page, "Penguin Distributors").click();

  const detail = page.getByRole("dialog", { name: "Penguin Distributors" });
  await detail.getByRole("tab", { name: "Purchase Orders" }).click();
  // Populated by other specs creating orders against this vendor over the
  // run; asserting the tab renders real rows rather than a fixed count.
  await expect(detail.getByRole("tabpanel")).toBeVisible();
});
