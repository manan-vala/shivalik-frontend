import { apiClient, fetchAll } from "./client.js";

/**
 * Staff API — `/api/v1/auth/…`.
 *
 * Every route here is admin-only (Django's `is_staff`, not the app's own
 * `Employee.role`), so these calls 403 for a signed-in employee who isn't
 * one. `staff/` and `approve/{id}/` back both the Staff screen and
 * Settings → Users — the backend has one `Employee` resource, not two.
 */

/** GET staff/ — every employee, any status. */
export function getStaff() {
  return fetchAll("/auth/staff/");
}

/** GET staff/pending/ — the approval queue. */
export function getPendingStaff() {
  return fetchAll("/auth/staff/pending/");
}

/**
 * POST staff/ — `{ email, name, password, role?, phone?, address?,
 * salary?, department? }`.
 *
 * Lands `Pending` regardless of who creates it — the backend has one
 * approval path, self-signup or admin-created alike — so a new hire still
 * needs `approveStaff` before they can sign in.
 */
export function createStaff(employee) {
  return apiClient("/auth/staff/", { body: employee });
}

/**
 * PATCH staff/{id}/ — same fields as `createStaff`, all optional. No
 * `password`: nothing in this API resets one, so the field is left out
 * rather than sent blank.
 */
export function updateStaff(id, employee) {
  return apiClient(`/auth/staff/${id}/`, { method: "PATCH", body: employee });
}

/** PATCH approve/{id}/ — moves a Pending employee to Approved. */
export function approveStaff(id) {
  return apiClient(`/auth/approve/${id}/`, {
    method: "PATCH",
    body: { status: "Approved" },
  });
}

/** PATCH approve/{id}/ — moves an employee to Rejected. A reason is required. */
export function rejectStaff(id, reason) {
  return apiClient(`/auth/approve/${id}/`, {
    method: "PATCH",
    body: { status: "Rejected", rejection_reason: reason },
  });
}

/** `Employee.Role.choices` — a fixed enum; adding one is a migration. */
export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "INVENTORY_MANAGER", label: "Inventory Manager" },
  { value: "DISPATCH_MANAGER", label: "Dispatch Manager" },
  { value: "FINANCE_MANAGER", label: "Finance Manager" },
  { value: "ORDER_MANAGER", label: "Order Manager" },
  { value: "MARKETING_MANAGER", label: "Marketing Manager" },
  { value: "MONEY_COLLECTOR", label: "Money Collector" },
  { value: "BINDING_MANAGER", label: "Binding Manager" },
  { value: "PRINTING_MANAGER", label: "Printing Manager" },
];

export function roleLabel(value) {
  return ROLE_OPTIONS.find((r) => r.value === value)?.label ?? value ?? "—";
}

/** `Employee.Status.choices`, and the badge tone each reads as. */
export const STATUS_TONES = {
  Pending: "warning",
  Approved: "success",
  Rejected: "error",
};
