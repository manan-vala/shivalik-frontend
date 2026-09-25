import { useId, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import { DetailList, PlainTable } from "../ui/PlainTable.jsx";
import { PO_STATUS, poTotal } from "../../data/purchaseOrders.js";
import { formatINR } from "../../lib/format.js";

/**
 * Purchase order detail — header fields, its lines, and whichever actions
 * its status actually allows:
 *
 *   DRAFT/PLACED   Edit, Dispatch, Cancel  (DRAFT also: Place Order)
 *   DISPATCHED     Receive, Cancel
 *   RECEIVED/CANCELLED  none — the backend refuses every further transition
 *
 * Mirrors `PurchaseOrderSerializer.validate()`'s transition table exactly,
 * so a button is never shown only to have the backend refuse it.
 */
export default function PurchaseOrderDetailDialog({
  order,
  open,
  onClose,
  onEdit,
  onPlace,
  onDispatch,
  onReceive,
  onCancel,
}) {
  const titleId = useId();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // CANCELLED is terminal — the backend allows no transition out of it —
  // so cancelling takes a second, explicit click.
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (!order) return null;
  const status = PO_STATUS[order.status] ?? PO_STATUS.DRAFT;

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={820}
      titleId={titleId}
      showCloseButton
      header={
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id={titleId} className="text-display-xs font-medium text-primary">
              PO-{order.id}
            </h2>
            <div className="flex items-center gap-2">
              <Badge tone={status.tone}>{status.label}</Badge>
              <span className="text-xs font-medium text-tertiary">{order.vendor_name}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-5">
        <DetailList
          items={[
            { label: "Vendor", value: order.vendor_name },
            { label: "Order Date", value: order.order_date || "—" },
            { label: "Expected Delivery", value: order.expected_delivery_date || "—" },
            { label: "Dispatched", value: order.dispatched_at ? new Date(order.dispatched_at).toLocaleString() : "—" },
            { label: "Received", value: order.received_at ? new Date(order.received_at).toLocaleString() : "—" },
            { label: "Created By", value: order.created_by_name || "—" },
            { label: "Notes", value: order.notes || "—" },
          ]}
        />

        <PlainTable
          columns={[
            { key: "book", label: "Book" },
            { key: "ordered", label: "Ordered", align: "center" },
            { key: "received", label: "Received", align: "center" },
            { key: "price", label: "Unit Price", align: "right" },
          ]}
          rows={order.lines.map((line) => ({
            book: `${line.book_title} (${line.isbn})`,
            ordered: line.quantity_ordered,
            received: line.quantity_received,
            price: formatINR(line.unit_price),
          }))}
        />

        <div className="flex justify-end text-md font-semibold text-primary">
          Total: {formatINR(poTotal(order))}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {confirmingCancel ? (
          <div className="flex flex-col gap-3 rounded-md border border-border-default bg-subtle p-4">
            <p className="text-sm font-medium text-primary">
              Cancel PO-{order.id}? A cancelled order can't be reopened.
            </p>
            <div className="flex gap-3">
              <Button
                variant="dangerOutline"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await onCancel(order);
                    setConfirmingCancel(false);
                  })
                }
              >
                Confirm Cancellation
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingCancel(false)} disabled={busy}>
                Keep Order
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {(order.status === "DRAFT" || order.status === "PLACED") && (
              <>
                <Button variant="secondary" onClick={() => onEdit(order)} disabled={busy}>
                  Edit
                </Button>
                {order.status === "DRAFT" && (
                  <Button variant="brandSubtle" onClick={() => run(() => onPlace(order))} disabled={busy}>
                    Place Order
                  </Button>
                )}
                <Button variant="primary" onClick={() => run(() => onDispatch(order))} disabled={busy}>
                  Dispatch
                </Button>
              </>
            )}

            {order.status === "DISPATCHED" && (
              <Button variant="primary" onClick={() => onReceive(order)} disabled={busy}>
                Receive Stock
              </Button>
            )}

            {["DRAFT", "PLACED", "DISPATCHED"].includes(order.status) && (
              <Button variant="dangerOutline" onClick={() => setConfirmingCancel(true)} disabled={busy}>
                Cancel Order
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
