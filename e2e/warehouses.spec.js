import { expect, test } from "@playwright/test";
import { adminApi, row, uniqueIsbn } from "./support/api.js";

// Reuses `uniqueIsbn` purely for its "unique per run" property, not for an
// actual ISBN — warehouse names must be unique too.
function uniqueName(prefix) {
  return uniqueIsbn(prefix);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/inventory/warehouses");
  await expect(page.getByRole("heading", { name: "Warehouse Inventory" })).toBeVisible();
});

test("creates a warehouse and it appears in the list, active", async ({ page, request }) => {
  const name = uniqueName("E2E-WH");
  await page.getByRole("button", { name: "Add Warehouse" }).click();

  const dialog = page.getByRole("dialog", { name: "Add Warehouse" });
  await dialog.getByLabel("Name").fill(name);
  await dialog.getByLabel("Code").fill("WH-E2E");
  await dialog.getByLabel("Location").fill("Test Lane");
  await dialog.getByLabel("Description").fill("Created by the e2e suite.");
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(dialog).toBeHidden();
  const created = row(page, name);
  await expect(created).toContainText("WH-E2E");
  await expect(created).toContainText("Test Lane");
  await expect(created).toContainText("Active");

  const api = await adminApi(request);
  const [warehouse] = (await api.get("/inventory/warehouses/")).results.filter((w) => w.name === name);
  expect(warehouse).toMatchObject({ code: "WH-E2E", location: "Test Lane", is_active: true });
});

test("editing a warehouse updates its row", async ({ page }) => {
  const name = uniqueName("E2E-EDIT");
  await page.getByRole("button", { name: "Add Warehouse" }).click();
  const addDialog = page.getByRole("dialog", { name: "Add Warehouse" });
  await addDialog.getByLabel("Name").fill(name);
  await addDialog.getByRole("button", { name: "Save" }).click();
  await expect(addDialog).toBeHidden();

  await row(page, name).getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Warehouse" });
  await expect(editDialog.getByLabel("Name")).toHaveValue(name);
  await editDialog.getByLabel("Location").fill("Updated Lane");
  await editDialog.getByRole("button", { name: "Save" }).click();

  await expect(editDialog).toBeHidden();
  await expect(row(page, name)).toContainText("Updated Lane");
});

test("deactivating and reactivating flips the status badge, not the row itself", async ({ page, request }) => {
  const name = uniqueName("E2E-TOGGLE");
  await page.getByRole("button", { name: "Add Warehouse" }).click();
  const addDialog = page.getByRole("dialog", { name: "Add Warehouse" });
  await addDialog.getByLabel("Name").fill(name);
  await addDialog.getByRole("button", { name: "Save" }).click();
  await expect(addDialog).toBeHidden();

  const target = row(page, name);
  await expect(target).toContainText("Active");
  await target.getByRole("button", { name: "Deactivate" }).click();
  await expect(target).toContainText("Inactive");

  const api = await adminApi(request);
  let [warehouse] = (await api.get("/inventory/warehouses/")).results.filter((w) => w.name === name);
  expect(warehouse.is_active).toBe(false);

  await target.getByRole("button", { name: "Activate" }).click();
  await expect(target).toContainText("Active");
  [warehouse] = (await api.get("/inventory/warehouses/")).results.filter((w) => w.name === name);
  expect(warehouse.is_active).toBe(true);
});

test("a blank name is refused before it reaches the API", async ({ page }) => {
  let posted = false;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().endsWith("/warehouses/")) posted = true;
  });

  await page.getByRole("button", { name: "Add Warehouse" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Warehouse" });
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(dialog.getByRole("alert")).toHaveText("Name is required.");
  expect(posted).toBe(false);
});
