import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import { Table, THead, TBody, TR, TH, TD } from "../ui/Table.jsx";
import { rackLabel } from "../../lib/api/inventory.js";

/**
 * Receive Purchase Order
 *
 * One row per line still outstanding (`quantity_ordered - quantity_received
 * > 0`), each defaulting to receiving the rest of it onto its book's
 * default rack when one is set (and still active). A line left at 0 is left
 * out of the request entirely — the backend accepts a partial receipt and
 * leaves the order DISPATCHED until every line is full — so "receive nothing
 * on this line yet" and "receive it all" are both one dialog.
 *
 * Only active racks are offered, the same rule IN Entry follows.
 */
export default function PurchaseOrderReceiveDialog({ order, racks, books, open, onClose, onReceived }) {
  const outstanding = (order?.lines ?? []).filter(
    (line) => line.quantity_ordered - line.quantity_received > 0
  );
  const activeRacks = racks.filter((r) => r.is_active);

  const [values, setValues] = useState(() => {
    const activeIds = new Set(activeRacks.map((r) => r.id));
    const defaultRackOf = new Map(books.map((b) => [b.id, b.default_rack]));
    return Object.fromEntries(
      outstanding.map((line) => {
        const rack = defaultRackOf.get(line.book);
        return [
          line.id,
          {
            quantity: String(line.quantity_ordered - line.quantity_received),
            rack: rack && activeIds.has(rack) ? String(rack) : "",
          },
        ];
      })
    );
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!order) return null;

  function update(lineId, patch) {
    setValues((v) => ({ ...v, [lineId]: { ...v[lineId], ...patch } }));
  }

  async function handleSubmit() {
    const lines = [];
    for (const line of outstanding) {
      const remaining = line.quantity_ordered - line.quantity_received;
      const { quantity, rack } = values[line.id];
      const qty = Number(quantity);

      if (qty === 0) continue;
      if (!Number.isInteger(qty) || qty < 0) {
        setError(`${line.book_title}: quantity must be a whole number.`);
        return;
      }
      if (qty > remaining) {
        setError(`${line.book_title}: cannot receive ${qty}, only ${remaining} outstanding.`);
        return;
      }
      if (!rack) {
        setError(`${line.book_title}: choose a rack to receive it onto.`);
        return;
      }
      lines.push({ line_id: line.id, quantity_received: qty, rack_id: Number(rack) });
    }

    if (lines.length === 0) {
      setError("Enter a quantity for at least one line.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onReceived(lines);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Receive Purchase Order PO-${order.id}`}
      width={860}
      showCloseButton
      footer={
        <>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? "Receiving..." : "Receive Stock"}
          </Button>
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </>
      }
    >
      <fieldset disabled={saving} className="contents">
        <div className="flex flex-col gap-4">
          {outstanding.length === 0 ? (
            <p className="text-md text-tertiary">Every line on this order has already been received.</p>
          ) : (
            <Table density="dense">
              <THead>
                <TR>
                  <TH width={260}>Book</TH>
                  <TH width={100}>Outstanding</TH>
                  <TH width={120}>Receive Qty</TH>
                  <TH width={260}>Rack</TH>
                </TR>
              </THead>
              <TBody>
                {outstanding.map((line) => {
                  const remaining = line.quantity_ordered - line.quantity_received;
                  return (
                    <TR key={line.id} data-testid={`receive-line-${line.id}`}>
                      <TD>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-primary">{line.book_title}</span>
                          <span className="text-xs text-tertiary">{line.isbn}</span>
                        </div>
                      </TD>
                      <TD>{remaining}</TD>
                      <TD>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          aria-label={`Receive quantity for ${line.book_title}`}
                          className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm"
                          value={values[line.id].quantity}
                          onChange={(e) => update(line.id, { quantity: e.target.value })}
                        />
                      </TD>
                      <TD>
                        <select
                          aria-label={`Rack for ${line.book_title}`}
                          className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm"
                          value={values[line.id].rack}
                          onChange={(e) => update(line.id, { rack: e.target.value })}
                        >
                          <option value="">Select rack...</option>
                          {activeRacks.map((r) => (
                            <option key={r.id} value={r.id}>
                              {rackLabel(r)}
                            </option>
                          ))}
                        </select>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}

          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </fieldset>
    </Modal>
  );
}
