import { expect, test } from "@playwright/test";
import { adminApi, row, uniqueIsbn } from "./support/api.js";
import { ADMIN } from "./support/env.js";

function uniqueEmail(prefix) {
  return `${uniqueIsbn(prefix)}@shivalik.test`.toLowerCase();
}

async function addStaff(page, { name, email, password, role }) {
  await page.goto("/admin/staff");
  await page.getByRole("button", { name: "Add Staff Member" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Staff Member" });
  await dialog.getByLabel("Name").fill(name);
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Password").fill(password);
  if (role) await dialog.getByLabel("Role").selectOption({ label: role });
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();
}

test("lists staff with role and status, admin included", async ({ page }) => {
  await page.goto("/admin/staff");

  const adminRow = row(page, ADMIN.email);
  await expect(adminRow).toContainText(ADMIN.name);
  await expect(adminRow).toContainText("Admin");
  await expect(adminRow).toContainText("Approved");

  const pending = row(page, "e2e.pending@shivalik.test");
  await expect(pending).toContainText("Pending");
  await expect(pending.getByRole("button", { name: "Approve" })).toBeVisible();
});

test("creating a staff member lands them Pending regardless of who made them", async ({ page, request }) => {
  const email = uniqueEmail("E2E-NewStaff");
  await addStaff(page, {
    name: "E2E New Hire",
    email,
    password: "E2e-New-Hire-2026!",
    role: "Inventory Manager",
  });

  const created = row(page, email);
  await expect(created).toContainText("Pending");
  await expect(created).toContainText("Inventory Manager");

  const api = await adminApi(request);
  const [staff] = (await api.get("/auth/staff/")).results.filter((s) => s.email === email);
  expect(staff).toMatchObject({ status: "Pending", role: "INVENTORY_MANAGER" });
});

test("editing a staff member updates their row without touching status", async ({ page }) => {
  await page.goto("/admin/staff");
  await row(page, "e2e.approved@shivalik.test").getByRole("button", { name: "View" }).click();

  const detail = page.getByRole("dialog", { name: "E2E Order Manager" });
  await detail.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit Staff Member" });
  await expect(editDialog.getByLabel("Email")).toBeDisabled();
  await editDialog.getByLabel("Department").fill("E2E Updated Department");
  await editDialog.getByRole("button", { name: "Save" }).click();
  await expect(editDialog).toBeHidden();

  await expect(row(page, "e2e.approved@shivalik.test")).toContainText("Approved");
  await row(page, "e2e.approved@shivalik.test").click();
  await expect(page.getByRole("dialog", { name: "E2E Order Manager" })).toContainText(
    "E2E Updated Department"
  );
});

test("the row's quick Approve moves Pending straight to Approved", async ({ page, request }) => {
  const email = uniqueEmail("E2E-QuickApprove");
  await addStaff(page, { name: "E2E Quick Approve", email, password: "E2e-Quick-2026!" });

  await row(page, email).getByRole("button", { name: "Approve" }).click();
  await expect(row(page, email)).toContainText("Approved");
  await expect(row(page, email).getByRole("button", { name: "Approve" })).toHaveCount(0);

  const api = await adminApi(request);
  const [staff] = (await api.get("/auth/staff/")).results.filter((s) => s.email === email);
  expect(staff.status).toBe("Approved");
  expect(staff.approved_at).not.toBeNull();
});

test("approving from the detail dialog works the same way", async ({ page }) => {
  const email = uniqueEmail("E2E-DetailApprove");
  await addStaff(page, { name: "E2E Detail Approve", email, password: "E2e-Detail-2026!" });

  await row(page, email).click();
  const detail = page.getByRole("dialog", { name: "E2E Detail Approve" });
  await expect(detail).toContainText("This application is awaiting a decision.");
  await detail.getByRole("button", { name: "Approve" }).click();

  await expect(detail).toBeHidden();
  await expect(row(page, email)).toContainText("Approved");
});

test("rejecting requires a reason, then records it", async ({ page, request }) => {
  const email = uniqueEmail("E2E-Reject");
  await addStaff(page, { name: "E2E To Reject", email, password: "E2e-Reject-2026!" });

  await row(page, email).click();
  const detail = page.getByRole("dialog", { name: "E2E To Reject" });
  await detail.getByRole("button", { name: "Reject" }).click();
  await detail.getByRole("button", { name: "Confirm Rejection" }).click();
  await expect(detail.getByRole("alert")).toHaveText(
    "A reason is required to reject an application."
  );

  await detail.getByLabel("Rejection Reason").fill("Missing verification documents.");
  await detail.getByRole("button", { name: "Confirm Rejection" }).click();
  await expect(detail).toBeHidden();

  await expect(row(page, email)).toContainText("Rejected");
  await row(page, email).click();
  await expect(page.getByRole("dialog", { name: "E2E To Reject" })).toContainText(
    "Missing verification documents."
  );

  const api = await adminApi(request);
  const [staff] = (await api.get("/auth/staff/")).results.filter((s) => s.email === email);
  expect(staff).toMatchObject({
    status: "Rejected",
    rejection_reason: "Missing verification documents.",
  });
});

test("a rejected applicant still cannot sign in", async ({ page, request }) => {
  const email = uniqueEmail("E2E-RejectLogin");
  const password = "E2e-RejectLogin-2026!";
  await addStaff(page, { name: "E2E Reject Login", email, password });
  await row(page, email).click();
  const detail = page.getByRole("dialog", { name: "E2E Reject Login" });
  await detail.getByRole("button", { name: "Reject" }).click();
  await detail.getByLabel("Rejection Reason").fill("Not a fit.");
  await detail.getByRole("button", { name: "Confirm Rejection" }).click();
  await expect(detail).toBeHidden();

  const login = await request.post("/api/v1/auth/login/", { data: { email, password } });
  expect(login.status()).toBe(401);
});
