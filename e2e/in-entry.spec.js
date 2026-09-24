import { expect, test } from "@playwright/test";
import { adminApi, row, uniqueIsbn } from "./support/api.js";

const rack = (name) => ({ label: `North Zone Main Hub / E2E Overflow / ${name}` });

async function fillLine(page, n, { isbn, title, mrp, qty, rackName }) {
  const line = page.getByTestId(`in-line-${n}`);
  await line.getByLabel(`ISBN, line ${n}`).fill(isbn);
  await line.getByLabel(`ISBN, line ${n}`).blur();
  if (title !== undefined) {
    await expect(line).toContainText("New title — will be registered");
    await line.getByLabel(`Book name, line ${n}`).fill(title);
    await line.getByLabel(`MRP, line ${n}`).fill(mrp);
  }
  await line.getByLabel(`Quantity, line ${n}`).fill(String(qty));
  await line.getByLabel(`Rack, line ${n}`).selectOption(rack(rackName));
  return line;
}

async function stockOf(api, isbn) {
  const rows = await api.get("/inventory/books/inventory/");
  return rows.filter((r) => r.isbn === isbn).reduce((sum, r) => sum + r.curr_stock, 0);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/inventory/in-entry");
  await expect(page.getByLabel("Vendor Name *")).toBeEnabled();
});

test("the rack picker offers every rack, not just the first API page", async ({ page }) => {
  // Seeded 8 + fixtures 21 = 29 racks; the API pages at 25.
  const options = page.getByLabel("Rack, line 1").locator("option");
  await expect(options).toHaveCount(30); // + the "Select rack..." prompt
  await expect(options.filter({ hasText: "E2E-TINY" })).toHaveCount(1);
});

test("stocks an existing title found by ISBN", async ({ page, request }) => {
  await page.getByLabel("Vendor Name *").selectOption({ label: "Penguin Distributors" });
  await expect(page.getByText("Net 30")).toBeVisible();

  const line = await fillLine(page, 1, { isbn: "E2E-IN-0001", qty: 12, rackName: "E2E-R01" });
  await expect(line).toContainText("In catalog");
  await expect(line.getByLabel("Book name, line 1")).toHaveValue("E2E Existing Title");

  await page.getByRole("button", { name: "Add To Inventory" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Booked in 12 units across 1 title(s) from Penguin Distributors."
  );
  expect(await stockOf(await adminApi(request), "E2E-IN-0001")).toBe(12);

  await page.goto("/admin/inventory");
  await expect(row(page, "E2E Existing Title").getByRole("cell").nth(2)).toHaveText("12");
});

test("registers a new title, then stocks it", async ({ page, request }) => {
  const isbn = uniqueIsbn("NEW");
  await page.getByLabel("Vendor Name *").selectOption({ label: "Tech Books India" });
  await fillLine(page, 1, { isbn, title: "E2E Fresh Arrival", mrp: "350", qty: 7, rackName: "E2E-R02" });

  await page.getByRole("button", { name: "Add To Inventory" }).click();

  await expect(page.getByRole("status")).toContainText("Booked in 7 units across 1 title(s)");
  const api = await adminApi(request);
  const [book] = (await api.get(`/inventory/books/?search=${isbn}`)).results;
  expect(book).toMatchObject({ title: "E2E Fresh Arrival", isbn, mrp: "350.00" });
  expect(await stockOf(api, isbn)).toBe(7);
});

test("a refused line keeps its place; lines before it are not booked twice", async ({ page, request }) => {
  const first = uniqueIsbn("OK");
  const second = uniqueIsbn("BIG");
  await page.getByLabel("Vendor Name *").selectOption({ label: "Penguin Distributors" });
  await fillLine(page, 1, { isbn: first, title: "E2E First Line", mrp: "100", qty: 3, rackName: "E2E-R03" });
  await page.getByRole("button", { name: "Add Book" }).click();
  // E2E-TINY holds 5, so the backend refuses 10.
  await fillLine(page, 2, { isbn: second, title: "E2E Second Line", mrp: "100", qty: 10, rackName: "E2E-TINY" });

  await page.getByRole("button", { name: "Add To Inventory" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    `Line 2 (ISBN ${second}) was not booked in: rack: This movement would exceed the rack's capacity. ` +
      "1 line(s) before it were booked in and removed from the form."
  );
  // Only the refused line is left on the form.
  await expect(page.getByTestId("in-line-2")).toHaveCount(0);
  await expect(page.getByLabel("ISBN, line 1")).toHaveValue(second);

  // Put it on a rack with room and resend: the first line must not repeat.
  await page.getByLabel("Rack, line 1").selectOption(rack("E2E-R04"));
  await page.getByRole("button", { name: "Add To Inventory" }).click();
  await expect(page.getByRole("status")).toContainText("Booked in 10 units across 1 title(s)");

  const api = await adminApi(request);
  expect(await stockOf(api, first)).toBe(3);
  expect(await stockOf(api, second)).toBe(10);
});

test("submitting straight from the ISBN field still recognises a catalog title", async ({ page, request }) => {
  await page.getByLabel("Vendor Name *").selectOption({ label: "Penguin Distributors" });
  await page.getByLabel("Quantity, line 1").fill("3");
  await page.getByLabel("Rack, line 1").selectOption(rack("E2E-R05"));
  // ISBN last, then straight to the button: the blur lookup is still in
  // flight when the submit starts.
  await page.getByLabel("ISBN, line 1").fill("E2E-QUICK-0001");
  await page.getByRole("button", { name: "Add To Inventory" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Booked in 3 units across 1 title(s) from Penguin Distributors."
  );
  expect(await stockOf(await adminApi(request), "E2E-QUICK-0001")).toBe(3);
});

test("the form is frozen while an entry is being saved", async ({ page }) => {
  // Hold each stock-in for a moment so the in-flight state can be seen. The
  // request still goes to the real backend.
  await page.route("**/stock-in/", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });

  await page.getByLabel("Vendor Name *").selectOption({ label: "Penguin Distributors" });
  await fillLine(page, 1, {
    isbn: uniqueIsbn("HOLD"),
    title: "E2E Held Title",
    mrp: "60",
    qty: 1,
    rackName: "E2E-R06",
  });
  await page.getByRole("button", { name: "Add To Inventory" }).click();

  await expect(page.getByRole("button", { name: "Adding..." })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Add Book" })).toBeDisabled();
  await expect(page.getByLabel("Quantity, line 1")).toBeDisabled();
  await expect(page.getByLabel("Vendor Name *")).toBeDisabled();

  await expect(page.getByRole("status")).toContainText("Booked in 1 units");
  await expect(page.getByRole("button", { name: "Add Book" })).toBeEnabled();
});

test("an entry without a vendor is stopped in the form", async ({ page }) => {
  await fillLine(page, 1, { isbn: "E2E-IN-0001", qty: 1, rackName: "E2E-R01" });
  await page.getByRole("button", { name: "Add To Inventory" }).click();

  await expect(page.getByRole("alert")).toHaveText("Choose the vendor this delivery came from.");
});
