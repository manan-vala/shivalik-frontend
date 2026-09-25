import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import { SelectField, TextField, Textarea } from "../ui/TextField.jsx";
import { Table, THead, TBody, TR, TH, TD } from "../ui/Table.jsx";
import { formatINR } from "../../lib/format.js";

/**
 * Add / Edit Purchase Order
 *
 * One dialog, two modes — the same construction as every other form dialog
 * in the app. Only reachable in edit mode while the order is DRAFT or
 * PLACED (`EDITABLE_STATUSES`): those are the only statuses whose `lines`
 * the backend will still let a PATCH touch.
 *
 * `vendors` and `books` are handed down from PurchaseOrdersPage rather than
 * fetched in here, so opening the dialog twice doesn't refetch the same
 * reference data twice.
 */

const TITLES = { add: "New Purchase Order", edit: "Edit Purchase Order" };

let nextKey = 1;
function emptyLine() {
  return { key: nextKey++, book: "", quantity_ordered: "1", unit_price: "" };
}

function seedLines(order) {
  if (!order?.lines?.length) return [emptyLine()];
  return order.lines.map((line) => ({
    key: nextKey++,
    book: String(line.book),
    quantity_ordered: String(line.quantity_ordered),
    unit_price: String(line.unit_price),
  }));
}

export default function PurchaseOrderFormDialog({
  mode = "add",
  order,
  vendors,
  books,
  open,
  onClose,
  onSaved,
}) {
  const [vendorId, setVendorId] = useState(() => (mode === "edit" ? String(order?.vendor ?? "") : ""));
  const [status, setStatus] = useState("DRAFT");
  const [orderDate, setOrderDate] = useState(order?.order_date ?? "");
  const [expectedDate, setExpectedDate] = useState(order?.expected_delivery_date ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [lines, setLines] = useState(() => seedLines(mode === "edit" ? order : null));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const booksById = new Map(books.map((b) => [String(b.id), b]));

  // By id, labelled with the GSTIN: `company_name` isn't unique on the
  // backend (only `gst_number` is), so picking by name could silently put
  // the order on the wrong vendor. Blocked vendors are left out — the stock
  // engine refuses to receive from one, so a new order for them could be
  // created and dispatched but never received. In edit mode the order's
  // own vendor stays listed even if it has since been blocked.
  const vendorOptions = vendors
    .filter((v) => !v.is_blocked || String(v.id) === String(order?.vendor))
    .map((v) => ({ value: String(v.id), label: `${v.company_name} (${v.gst_number})` }));

  function updateLine(key, patch) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function setBook(key, bookId) {
    const book = booksById.get(bookId);
    updateLine(key, { book: bookId, unit_price: book?.mrp ?? "" });
  }

  function removeLine(key) {
    setLines((current) => (current.length > 1 ? current.filter((l) => l.key !== key) : current));
  }

  const total = lines.reduce(
    (sum, l) => sum + (Number(l.quantity_ordered) || 0) * (Number(l.unit_price) || 0),
    0
  );

  function validate() {
    if (!vendorId) return "Choose a vendor.";
    for (const [i, line] of lines.entries()) {
      const label = `Line ${i + 1}`;
      if (!line.book) return `${label}: choose a book.`;
      const qty = Number(line.quantity_ordered);
      if (!Number.isInteger(qty) || qty < 1) return `${label}: quantity must be a whole number of at least 1.`;
      if (line.unit_price === "" || Number(line.unit_price) < 0) return `${label}: enter a unit price.`;
    }
    return null;
  }

  async function handleSave() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    const payload = {
      vendor: Number(vendorId),
      order_date: orderDate || null,
      expected_delivery_date: expectedDate || null,
      notes,
      lines: lines.map((l) => ({
        book: Number(l.book),
        quantity_ordered: Number(l.quantity_ordered),
        unit_price: l.unit_price,
      })),
    };
    if (mode === "add") payload.status = status;

    setSaving(true);
    setError("");
    try {
      await onSaved(payload);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLES[mode]}
      width={960}
      showCloseButton
      footer={
        <>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : mode === "add" ? "Create Purchase Order" : "Save Changes"}
          </Button>
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </>
      }
    >
      <fieldset disabled={saving} className="contents">
        <div className="flex flex-col gap-4">
          <div className="flex gap-6">
            <SelectField
              label="Vendor"
              className="flex-1"
              options={vendorOptions}
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            />
            {mode === "add" && (
              <SelectField
                label="Status"
                className="flex-1"
                options={["Draft", "Placed"]}
                value={status === "PLACED" ? "Placed" : "Draft"}
                onChange={(e) => setStatus(e.target.value === "Placed" ? "PLACED" : "DRAFT")}
              />
            )}
          </div>

          <div className="flex gap-6">
            <TextField
              label="Order Date"
              type="date"
              className="flex-1"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
            <TextField
              label="Expected Delivery"
              type="date"
              className="flex-1"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-md font-semibold text-tertiary">Lines</span>
              <Button variant="brandSubtle" size="sm" iconLeading="plus" onClick={() => setLines((c) => [...c, emptyLine()])}>
                Add Line
              </Button>
            </div>

            <Table density="dense">
              <THead>
                <TR>
                  <TH width={320}>Book</TH>
                  <TH width={120}>Quantity</TH>
                  <TH width={140}>Unit Price</TH>
                  <TH width={50} align="center">
                    <span className="sr-only">Remove</span>
                  </TH>
                </TR>
              </THead>
              <TBody>
                {lines.map((line, i) => (
                  <TR key={line.key} data-testid={`po-line-${i + 1}`}>
                    <TD>
                      <select
                        aria-label={`Book, line ${i + 1}`}
                        className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm"
                        value={line.book}
                        onChange={(e) => setBook(line.key, e.target.value)}
                      >
                        <option value="">Select book...</option>
                        {books.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title} ({b.isbn})
                          </option>
                        ))}
                      </select>
                    </TD>
                    <TD>
                      <input
                        type="number"
                        min="1"
                        aria-label={`Quantity, line ${i + 1}`}
                        className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm"
                        value={line.quantity_ordered}
                        onChange={(e) => updateLine(line.key, { quantity_ordered: e.target.value })}
                      />
                    </TD>
                    <TD>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label={`Unit price, line ${i + 1}`}
                        className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm"
                        value={line.unit_price}
                        onChange={(e) => updateLine(line.key, { unit_price: e.target.value })}
                      />
                    </TD>
                    <TD align="center">
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="p-1 text-error-500 hover:text-error-700"
                        aria-label={`Remove line ${i + 1}`}
                      >
                        ✕
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <div className="flex justify-end text-md font-semibold text-primary">
              Total: {formatINR(total)}
            </div>
          </div>

          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </fieldset>
    </Modal>
  );
}
