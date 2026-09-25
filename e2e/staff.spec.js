import { expect, test } from "@playwright/test";
import { adminApi, row, uniqueIsbn } from "./support/api.js";
import { ADMIN } from "./support/env.js";

function uniqueEmail(prefix) {
  return `${uniqueIsbn(prefix)}@shivalik.test`.toLowerCase();
}

async function addStaff(page, { name, email, role }) {
  await page.goto("/admin/staff");
  await page.getByRole("button", { name: "Add Staff Member" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Staff Member" });
  await dialog.getByLabel("Name").fill(name);
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Password").fill("E2e-Staff-Pass-2026!");
  if (role) await dialog.getByLabel("Role").selectOption({ label: role });
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();
}

async function staffByEmail(request, email) {
  const api = await adminApi(request);
  return (await api.get("/auth/staff/")).results.find((s) => s.email === email);
}

test("a new staff member lands Pending with the chosen role", async ({ page, request }) => {
  const email = uniqueEmail("E2E-NewStaff");
  await addStaff(page, { name: "E2E New Hire", email, role: "Inventory Manager" });

  await expect(row(page, email)).toContainText("Pending");
  await expect(row(page, email)).toContainText("Inventory Manager");
  expect(await staffByEmail(request, email)).toMatchObject({
    status: "Pending",
    role: "INVENTORY_MANAGER",
  });
});

test("editing keeps status, with email locked and no password field", async ({ page, request }) => {
  await page.goto("/admin/staff");
  await row(page, "e2e.approved@shivalik.test").click();
  await page.getByRole("dialog", { name: "E2E Order Manager" }).getByRole("button", { name: "Edit" }).click();

  const edit = page.getByRole("dialog", { name: "Edit Staff Member" });
  await expect(edit.getByLabel("Email")).toBeDisabled();
  await expect(edit.getByLabel("Password")).toHaveCount(0);
  await edit.getByLabel("Department").fill("E2E Updated Department");
  await edit.getByRole("button", { name: "Save" }).click();
  await expect(edit).toBeHidden();

  expect(await staffByEmail(request, "e2e.approved@shivalik.test")).toMatchObject({
    status: "Approved",
    department: "E2E Updated Department",
  });
});

test("the row's Approve moves Pending to Approved, credited to the signed-in admin", async ({ page }) => {
  const email = uniqueEmail("E2E-Approve");
  await addStaff(page, { name: "E2E To Approve", email });

  await row(page, email).getByRole("button", { name: "Approve" }).click();
  await expect(row(page, email)).toContainText("Approved");

  await row(page, email).click();
  const detail = page.getByRole("dialog", { name: "E2E To Approve" });
  // A name, not the bare employee id `approved_by` carries on the wire.
  await expect(detail.getByRole("definition").filter({ hasText: ADMIN.name })).toBeVisible();
});

test("rejecting requires a reason and records it", async ({ page, request }) => {
  const email = uniqueEmail("E2E-Reject");
  await addStaff(page, { name: "E2E To Reject", email });

  await row(page, email).click();
  const detail = page.getByRole("dialog", { name: "E2E To Reject" });
  await detail.getByRole("button", { name: "Reject" }).click();
  await detail.getByRole("button", { name: "Confirm Rejection" }).click();
  await expect(detail.getByRole("alert")).toHaveText("A reason is required to reject an application.");

  await detail.getByLabel("Rejection Reason").fill("Missing verification documents.");
  await detail.getByRole("button", { name: "Confirm Rejection" }).click();
  await expect(detail).toBeHidden();
  await expect(row(page, email)).toContainText("Rejected");

  expect(await staffByEmail(request, email)).toMatchObject({
    status: "Rejected",
    rejection_reason: "Missing verification documents.",
  });
});
