import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { SelectField } from "../ui/TextField.jsx";
import { CLIENTS } from "../../data/clients.js";
import { INVOICE_DRAFT, formatINR } from "../../data/dashboard.js";

/**
 * Generate Invoice dialog
 * Figma: FINAL SCREENS / Shivalik / Group 9 (node 790:22793)
 *
 * Client picker, editable line items, computed totals, payment terms.
 * Totals are derived from the lines rather than hardcoded, so adding or
 * removing a line keeps the invoice self-consistent - the Figma figures happen
 * to agree with this arithmetic.
 */

const BLANK_LINE = { item: "", qty: 0, price: 0 };

export default function GenerateInvoiceDialog({ open, onClose, onConfirm }) {
  const [client, setClient] = useState("");
  const [items, setItems] = useState(INVOICE_DRAFT.items);
  const [terms, setTerms] = useState(INVOICE_DRAFT.paymentTerms[0]);

  function handleClose() {
    setClient("");
    setItems(INVOICE_DRAFT.items);
    setTerms(INVOICE_DRAFT.paymentTerms[0]);
    onClose();
  }

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const discount = Math.round((subtotal * INVOICE_DRAFT.discountPercent) / 100);
  const gst = Math.round(((subtotal - discount) * INVOICE_DRAFT.gstPercent) / 100);
  const grandTotal = subtotal - discount + gst;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Generate Invoice"
      footer={
        <>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => {
              onConfirm?.({ client, items, terms, grandTotal });
              handleClose();
            }}
          >
            Confirm
          </Button>
          <Button variant="secondary" size="lg" onClick={handleClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <SelectField
          label="Client"
          placeholder="Select client"
          options={CLIENTS.map((c) => c.name)}
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />

        <div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-2 text-left font-medium text-tertiary">Item</th>
                <th className="py-2 text-right font-medium text-tertiary">Qty</th>
                <th className="py-2 text-right font-medium text-tertiary">Price</th>
                <th className="py-2 text-right font-medium text-tertiary">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((line, i) => (
                <tr key={i} className="border-b border-border-subtle">
                  <td className="py-2 text-primary">{line.item || "New line"}</td>
                  <td className="tabular py-2 text-right text-primary">{line.qty}</td>
                  <td className="tabular py-2 text-right text-primary">
                    {formatINR(line.price)}
                  </td>
                  <td className="tabular py-2 text-right text-primary">
                    {formatINR(line.qty * line.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={() => setItems((v) => [...v, { ...BLANK_LINE }])}
            className="mt-2 flex items-center gap-1 rounded-md px-1 py-1 text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            <Icon name="plus" size="sm" />
            Add line
          </button>
        </div>

        <dl className="flex flex-col gap-1 text-sm">
          <Row label="Subtotal" value={formatINR(subtotal)} />
          <Row
            label={`Discount ${INVOICE_DRAFT.discountPercent}%`}
            value={`-${formatINR(discount)}`}
          />
          <Row label={`GST ${INVOICE_DRAFT.gstPercent}%`} value={formatINR(gst)} />
          <div className="flex items-center justify-between border-t border-border-default pt-2">
            <dt className="text-lg font-semibold text-primary">Grand Total</dt>
            <dd className="tabular m-0 text-lg font-semibold text-primary">
              {formatINR(grandTotal)}
            </dd>
          </div>
        </dl>

        <SelectField
          label="Payment Terms"
          options={INVOICE_DRAFT.paymentTerms}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
        />
      </div>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-tertiary">{label}</dt>
      <dd className="tabular m-0 text-primary">{value}</dd>
    </div>
  );
}
