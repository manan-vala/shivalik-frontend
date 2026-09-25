import { expect, test } from "@playwright/test";
import { adminApi, row, uniqueIsbn } from "./support/api.js";

async function warehouseByName(request, name) {
  const api = await adminApi(request);
  return (await api.get("/inventory/warehouses/")).results.find((w) => w.name === name);
}

// `code` is unique among warehouses that set one, so each gets its own.
async function addWarehouse(page, name, code) {
  await page.goto("/admin/inventory/warehouses");
  await page.getByRole("button", { name: "Add Warehouse" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Warehouse" });
  await dialog.getByLabel("Name").fill(name);
  await dialog.getByLabel("Code").fill(code);
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();
}

test("creates a warehouse, then edits it", async ({ page, request }) => {
  const name = uniqueIsbn("E2E-WH");
  await addWarehouse(page, name, "WH-E2E-EDIT");
  await expect(row(page, name)).toContainText("WH-E2E-EDIT");
  await expect(row(page, name)).toContainText("Active");

  await row(page, name).getByRole("button", { name: "Edit" }).click();
  const edit = page.getByRole("dialog", { name: "Edit Warehouse" });
  await expect(edit.getByLabel("Name")).toHaveValue(name);
  await edit.getByLabel("Location").fill("Updated Lane");
  await edit.getByRole("button", { name: "Save" }).click();
  await expect(edit).toBeHidden();
  await expect(row(page, name)).toContainText("Updated Lane");

  expect(await warehouseByName(request, name)).toMatchObject({
    code: "WH-E2E-EDIT",
    location: "Updated Lane",
    is_active: true,
  });
});

test("deactivates and reactivates rather than deleting", async ({ page, request }) => {
  const name = uniqueIsbn("E2E-TOGGLE");
  await addWarehouse(page, name, "WH-E2E-TOGGLE");

  await row(page, name).getByRole("button", { name: "Deactivate" }).click();
  await expect(row(page, name)).toContainText("Inactive");
  expect((await warehouseByName(request, name)).is_active).toBe(false);

  await row(page, name).getByRole("button", { name: "Activate" }).click();
  await expect(row(page, name)).toContainText("Active");
  expect((await warehouseByName(request, name)).is_active).toBe(true);
});
