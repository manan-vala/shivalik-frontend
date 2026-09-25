import { expect, test } from "@playwright/test";
import { adminApi, row } from "./support/api.js";

const VENDOR = "E2E PO Vendor";
const VENDOR_GST = "28AAAAA5555A1Z5";
// The fixtures hold a second "E2E PO Vendor" under another GSTIN; the picker
// must choose by id, so its label carries the GSTIN.
const VENDOR_OPTION = `${VENDOR} (${VENDOR_GST})`;
const EXISTING = "E2E Existing Title (E2E-IN-0001)";
const QUICK = "E2E Quick Title (E2E-QUICK-0001)";

async function createOrder(page, lines, { status } = {}) {
  await page.goto("/admin/vendors/purchase-orders");
  await page.getByRole("button", { name: "New Purchase Order" }).click();
  const form = page.getByRole("dialog", { name: "New Purchase Order" });
  await form.getByLabel("Vendor").selectOption({ label: VENDOR_OPTION });
  if (status) await form.getByLabel("Status").selectOption(status);
  for (const [i, line] of lines.entries()) {
    if (i > 0) await form.getByRole("button", { name: "Add Line" }).click();
    const n = i + 1;
    await form.getByLabel(`Book, line ${n}`).selectOption({ label: line.book });
    await form.getByLabel(`Quantity, line ${n}`).fill(String(line.qty));
  }
  return form;
}

/**
 * Opens the newest order for this vendor. The list is `-created_at` and this
 * spec is the only one that orders from it, so that's the order the test
 * just made.
 */
async function openLatestOrder(page) {
  await page.goto("/admin/vendors/purchase-orders");
  await page.getByLabel("Search purchase orders").fill(VENDOR);
  await page.getByRole("row").filter({ hasText: VENDOR }).first().click();
  const dialog = page.getByRole("dialog").filter({ hasText: "PO-" });
  const heading = await dialog.locator("h2").first().textContent();
  return { dialog, id: Number(heading.replace("PO-", "")) };
}

test("creates an order: vendor picked by id, blocked vendors not offered, lines priced at MRP", async ({ page, request }) => {
  const form = await createOrder(page, [
    { book: EXISTING, qty: 5 },
    { book: QUICK, qty: 3 },
  ]);

  await expect(form.getByLabel("Vendor").locator("option", { hasText: "E2E Blocked Vendor" })).toHaveCount(0);
  await expect(form.getByLabel("Unit price, line 1")).toHaveValue("250.00");
  await expect(form.getByLabel("Unit price, line 2")).toHaveValue("180.00");
  await expect(form.getByText("Total: ₹1,790.00")).toBeVisible();

  await form.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(form).toBeHidden();

  const { dialog, id } = await openLatestOrder(page);
  await expect(dialog).toContainText("Draft");

  const api = await adminApi(request);
  const order = await api.get(`/inventory/purchase-orders/${id}/`);
  // `vendors/?search=` covers company and vendor name only, not GSTIN.
  const vendor = (await api.get("/inventory/vendors/")).results.find((v) => v.gst_number === VENDOR_GST);
  expect(order.vendor).toBe(vendor.id);
  expect(order.lines.map((l) => l.quantity_ordered).sort()).toEqual([3, 5]);

  // The vendor's own detail dialog lists it too.
  await page.goto("/admin/vendors");
  await row(page, VENDOR_GST).click();
  const detail = page.getByRole("dialog", { name: VENDOR });
  await detail.getByRole("tab", { name: "Purchase Orders" }).click();
  await expect(detail.getByRole("tabpanel")).toContainText(`PO-${id}`);
});

test("lifecycle: edit while draft, place, dispatch, then receive in two passes", async ({ page, request }) => {
  const api = await adminApi(request);
  const form = await createOrder(page, [{ book: EXISTING, qty: 10 }]);
  await form.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(form).toBeHidden();

  let { dialog, id } = await openLatestOrder(page);
  await dialog.getByRole("button", { name: "Edit" }).click();
  const edit = page.getByRole("dialog", { name: "Edit Purchase Order" });
  await edit.getByLabel("Quantity, line 1").fill("8");
  await edit.getByRole("button", { name: "Save Changes" }).click();
  await expect(edit).toBeHidden();
  expect((await api.get(`/inventory/purchase-orders/${id}/`)).lines[0].quantity_ordered).toBe(8);

  ({ dialog } = await openLatestOrder(page));
  await dialog.getByRole("button", { name: "Place Order" }).click();
  await expect(dialog).toContainText("Placed");
  await dialog.getByRole("button", { name: "Dispatch" }).click();
  await expect(dialog).toContainText("Dispatched");
  await expect(dialog.getByRole("button", { name: "Edit" })).toHaveCount(0);

  // Partial receipt: the order stays DISPATCHED.
  await dialog.getByRole("button", { name: "Receive Stock" }).click();
  let receive = page.getByRole("dialog", { name: `Receive Purchase Order PO-${id}` });
  await receive.getByLabel("Receive quantity for E2E Existing Title").fill("5");
  await receive.getByLabel("Rack for E2E Existing Title").selectOption({
    label: "North Zone Main Hub / E2E Overflow / E2E-R07",
  });
  await receive.getByRole("button", { name: "Receive Stock" }).click();
  await expect(receive).toBeHidden();

  let order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.status).toBe("DISPATCHED");
  expect(order.lines[0].quantity_received).toBe(5);

  // The rest: defaults to what's still outstanding, and completes the order.
  ({ dialog } = await openLatestOrder(page));
  await dialog.getByRole("button", { name: "Receive Stock" }).click();
  receive = page.getByRole("dialog", { name: `Receive Purchase Order PO-${id}` });
  await expect(receive.getByLabel("Receive quantity for E2E Existing Title")).toHaveValue("3");
  await receive.getByLabel("Rack for E2E Existing Title").selectOption({
    label: "North Zone Main Hub / E2E Overflow / E2E-R08",
  });
  await receive.getByRole("button", { name: "Receive Stock" }).click();
  await expect(receive).toBeHidden();

  order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.status).toBe("RECEIVED");
  expect(order.lines[0].quantity_received).toBe(8);

  const ledger = await api.get("/inventory/books/inventory/");
  const onRack = (rack) =>
    ledger.find((r) => r.isbn === "E2E-IN-0001" && r.rack_location.endsWith(rack)).curr_stock;
  expect(onRack("E2E-R07")).toBe(5);
  expect(onRack("E2E-R08")).toBe(3);
});

test("cancelling asks for confirmation, then leaves nothing to do", async ({ page, request }) => {
  const form = await createOrder(page, [{ book: EXISTING, qty: 2 }], { status: "Placed" });
  await form.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(form).toBeHidden();

  const { dialog, id } = await openLatestOrder(page);
  await dialog.getByRole("button", { name: "Cancel Order" }).click();
  await dialog.getByRole("button", { name: "Keep Order" }).click();
  await expect(dialog).toContainText("Placed");

  await dialog.getByRole("button", { name: "Cancel Order" }).click();
  await dialog.getByRole("button", { name: "Confirm Cancellation" }).click();
  await expect(dialog).toContainText("Cancelled");
  for (const label of ["Edit", "Place Order", "Dispatch", "Cancel Order", "Receive Stock"]) {
    await expect(dialog.getByRole("button", { name: label })).toHaveCount(0);
  }

  const api = await adminApi(request);
  expect((await api.get(`/inventory/purchase-orders/${id}/`)).status).toBe("CANCELLED");
});
