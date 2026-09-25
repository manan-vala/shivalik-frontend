/**
 * Shared display constants for `PurchaseOrder.Status` (backend
 * `inventory/models/vendor.py`). One source so the Vendor detail dialog and
 * the Purchase Orders screen read the same badge for the same status.
 */
export const PO_STATUS = {
  DRAFT: { label: "Draft", tone: "neutral" },
  PLACED: { label: "Placed", tone: "info" },
  DISPATCHED: { label: "Dispatched", tone: "progress" },
  RECEIVED: { label: "Received", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "alert" },
};

/** Total value of a purchase order: sum of each line's qty × unit price. */
export function poTotal(order) {
  return (order.lines ?? []).reduce(
    (sum, line) => sum + Number(line.quantity_ordered) * Number(line.unit_price),
    0
  );
}

/** Statuses `updatePurchaseOrder`/the edit dialog may still touch lines on. */
export const EDITABLE_STATUSES = new Set(["DRAFT", "PLACED"]);
