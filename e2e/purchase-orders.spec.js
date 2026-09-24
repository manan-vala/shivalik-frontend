import { expect, test } from "@playwright/test";
import { adminApi, row } from "./support/api.js";

const VENDOR = "E2E PO Vendor";

/**
 * Opens the most recently created order for `vendorName` (list order is
 * `-created_at`, and this spec's tests run one after another on a single
 * worker, so "search this vendor, take the first row" always means "the
 * order the test just made").
 */
async function openLatestOrder(page, vendorName = VENDOR) {
  await page.goto("/admin/vendors/purchase-orders");
  await page.getByLabel("Search purchase orders").fill(vendorName);
  const first = page.getByRole("row").filter({ hasText: vendorName }).first();
  await first.click();
  const dialog = page.getByRole("dialog").filter({ hasText: "PO-" });
  await expect(dialog).toBeVisible();
  const heading = await dialog.locator("h2").first().textContent();
  return { dialog, id: Number(heading.replace("PO-", "")) };
}

async function fillLine(dialog, i, { bookLabel, qty, price }) {
  const line = dialog.getByTestId(`po-line-${i}`);
  if (bookLabel) await line.getByLabel(`Book, line ${i}`).selectOption({ label: bookLabel });
  if (qty !== undefined) await line.getByLabel(`Quantity, line ${i}`).fill(String(qty));
  if (price !== undefined) await line.getByLabel(`Unit price, line ${i}`).fill(String(price));
}

test("creates a draft purchase order with two lines, priced and totalled correctly", async ({ page, request }) => {
  await page.goto("/admin/vendors/purchase-orders");
  await page.getByRole("button", { name: "New Purchase Order" }).click();

  const form = page.getByRole("dialog", { name: "New Purchase Order" });
  await form.getByLabel("Vendor").selectOption({ label: VENDOR });
  await fillLine(form, 1, { bookLabel: "E2E Existing Title (E2E-IN-0001)", qty: 5 });
  // MRP (250.00) is filled in automatically once a book is chosen.
  await expect(form.getByLabel("Unit price, line 1")).toHaveValue("250.00");

  await form.getByRole("button", { name: "Add Line" }).click();
  await fillLine(form, 2, { bookLabel: "E2E Quick Title (E2E-QUICK-0001)", qty: 3 });
  await expect(form.getByLabel("Unit price, line 2")).toHaveValue("180.00");

  await expect(form.getByText("Total: ₹1,790.00")).toBeVisible();
  await form.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(form).toBeHidden();

  const { dialog, id } = await openLatestOrder(page);
  await expect(dialog).toContainText("Draft");
  await expect(dialog).toContainText("E2E Existing Title");
  await expect(dialog).toContainText("E2E Quick Title");
  await expect(dialog).toContainText("Total: ₹1,790.00");

  const api = await adminApi(request);
  const order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.status).toBe("DRAFT");
  expect(order.lines).toHaveLength(2);
  expect(order.lines.map((l) => l.quantity_ordered).sort()).toEqual([3, 5]);
});

test("the full lifecycle: edit while draft, place, dispatch, then receive in two passes", async ({ page, request }) => {
  const api = await adminApi(request);

  // -- create -------------------------------------------------------------
  await page.goto("/admin/vendors/purchase-orders");
  await page.getByRole("button", { name: "New Purchase Order" }).click();
  const createForm = page.getByRole("dialog", { name: "New Purchase Order" });
  await createForm.getByLabel("Vendor").selectOption({ label: VENDOR });
  await fillLine(createForm, 1, { bookLabel: "E2E Existing Title (E2E-IN-0001)", qty: 10 });
  await createForm.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(createForm).toBeHidden();

  let { dialog, id } = await openLatestOrder(page);

  // -- edit while DRAFT -----------------------------------------------------
  await dialog.getByRole("button", { name: "Edit" }).click();
  const editForm = page.getByRole("dialog", { name: "Edit Purchase Order" });
  await fillLine(editForm, 1, { qty: 8 });
  await editForm.getByRole("button", { name: "Save Changes" }).click();
  await expect(editForm).toBeHidden();

  let order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.lines[0].quantity_ordered).toBe(8);

  // -- place ----------------------------------------------------------------
  ({ dialog } = await openLatestOrder(page));
  await dialog.getByRole("button", { name: "Place Order" }).click();
  await expect(dialog).toContainText("Placed");
  // Once placed, "Place Order" itself is gone but Edit/Dispatch/Cancel remain.
  await expect(dialog.getByRole("button", { name: "Place Order" })).toHaveCount(0);

  // -- dispatch ---------------------------------------------------------------
  await dialog.getByRole("button", { name: "Dispatch" }).click();
  await expect(dialog).toContainText("Dispatched");
  await expect(dialog.getByRole("button", { name: "Edit" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Receive Stock" })).toBeVisible();

  order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.status).toBe("DISPATCHED");
  expect(order.dispatched_at).not.toBeNull();

  // -- receive, partially --------------------------------------------------
  await dialog.getByRole("button", { name: "Receive Stock" }).click();
  const receive = page.getByRole("dialog", { name: `Receive Purchase Order PO-${id}` });
  await receive.getByLabel("Receive quantity for E2E Existing Title").fill("5");
  await receive.getByLabel("Rack for E2E Existing Title").selectOption({
    label: "North Zone Main Hub / E2E Overflow / E2E-R07",
  });
  await receive.getByRole("button", { name: "Receive Stock" }).click();
  await expect(receive).toBeHidden();

  order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.status).toBe("DISPATCHED"); // partial: not fully received yet
  expect(order.lines[0].quantity_received).toBe(5);

  const ledgerAfterPartial = await api.get("/inventory/books/inventory/");
  const r07Row = ledgerAfterPartial.find(
    (r) => r.isbn === "E2E-IN-0001" && r.rack_location.endsWith("E2E-R07")
  );
  expect(r07Row.curr_stock).toBe(5);

  // -- receive the rest -----------------------------------------------------
  ({ dialog } = await openLatestOrder(page));
  await dialog.getByRole("button", { name: "Receive Stock" }).click();
  const receive2 = page.getByRole("dialog", { name: `Receive Purchase Order PO-${id}` });
  // Defaults to the full 3 still outstanding (8 ordered - 5 already received).
  await expect(receive2.getByLabel("Receive quantity for E2E Existing Title")).toHaveValue("3");
  await receive2.getByLabel("Receive quantity for E2E Existing Title").fill("3");
  await receive2.getByLabel("Rack for E2E Existing Title").selectOption({
    label: "North Zone Main Hub / E2E Overflow / E2E-R08",
  });
  await receive2.getByRole("button", { name: "Receive Stock" }).click();
  await expect(receive2).toBeHidden();

  order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.status).toBe("RECEIVED");
  expect(order.received_at).not.toBeNull();
  expect(order.lines[0].quantity_received).toBe(8);
});

test("cancelling a placed order leaves no further actions", async ({ page, request }) => {
  await page.goto("/admin/vendors/purchase-orders");
  await page.getByRole("button", { name: "New Purchase Order" }).click();
  const form = page.getByRole("dialog", { name: "New Purchase Order" });
  await form.getByLabel("Vendor").selectOption({ label: VENDOR });
  await form.getByLabel("Status").selectOption("Placed");
  await fillLine(form, 1, { bookLabel: "E2E Existing Title (E2E-IN-0001)", qty: 2 });
  await form.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(form).toBeHidden();

  const { dialog, id } = await openLatestOrder(page);
  await expect(dialog).toContainText("Placed");
  await dialog.getByRole("button", { name: "Cancel Order" }).click();
  await expect(dialog).toContainText("Cancelled");
  // A cancelled order has nothing left to do — only the dialog's own Close.
  for (const label of ["Edit", "Place Order", "Dispatch", "Cancel Order", "Receive Stock"]) {
    await expect(dialog.getByRole("button", { name: label })).toHaveCount(0);
  }

  const api = await adminApi(request);
  const order = await api.get(`/inventory/purchase-orders/${id}/`);
  expect(order.status).toBe("CANCELLED");
});

test("the status filter and search narrow the list", async ({ page }) => {
  // Self-contained rather than relying on orders earlier tests happened to
  // leave behind: creates its own DRAFT order and checks the list around it.
  await page.goto("/admin/vendors/purchase-orders");
  await page.getByRole("button", { name: "New Purchase Order" }).click();
  const form = page.getByRole("dialog", { name: "New Purchase Order" });
  await form.getByLabel("Vendor").selectOption({ label: VENDOR });
  await fillLine(form, 1, { bookLabel: "E2E Existing Title (E2E-IN-0001)", qty: 1 });
  await form.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(form).toBeHidden();

  const { id } = await openLatestOrder(page);
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();

  await page.getByLabel("Search purchase orders").fill(VENDOR);
  await expect(row(page, `PO-${id}`)).toContainText("Draft");

  await page.getByLabel("Filter by status").selectOption("Draft");
  await expect(row(page, `PO-${id}`)).toBeVisible();

  await page.getByLabel("Filter by status").selectOption("Received");
  await expect(row(page, `PO-${id}`)).toHaveCount(0);
});

test("vendor and line choices are required before the API is called", async ({ page }) => {
  let posted = false;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().endsWith("/purchase-orders/")) posted = true;
  });

  await page.goto("/admin/vendors/purchase-orders");
  await page.getByRole("button", { name: "New Purchase Order" }).click();
  const form = page.getByRole("dialog", { name: "New Purchase Order" });
  await form.getByRole("button", { name: "Create Purchase Order" }).click();

  await expect(form.getByRole("alert")).toHaveText("Choose a vendor.");
  expect(posted).toBe(false);

  await form.getByLabel("Vendor").selectOption({ label: VENDOR });
  await form.getByRole("button", { name: "Create Purchase Order" }).click();
  await expect(form.getByRole("alert")).toHaveText("Line 1: choose a book.");
  expect(posted).toBe(false);
});
