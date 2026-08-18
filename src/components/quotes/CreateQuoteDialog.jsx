import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { TextField, SelectField } from "../ui/TextField.jsx";
import { CLIENTS } from "../../data/clients.js";
import { QUOTE_OPTIONS, QUOTE_COSTS, formatINR } from "../../data/dashboard.js";

/**
 * Create Quote dialog
 * Figma: FINAL SCREENS / Shivalik / Group 8 (node 790:22695)
 *
 * Job specification on top, costed breakdown underneath, two actions.
 *
 * NOTE ON THE FIGMA NUMBERS: the mockup's cost table does not add up - the
 * line items total ₹5,79,500 but Subtotal, GST and Grand Total all read
 * ₹90,000, and Discount% shows a bare "5" in the total column. Those are
 * placeholder figures, so the line items are rendered as designed and the
 * totals are computed from them instead of copied. Wire to the pricing
 * endpoint when it exists.
 */

const EMPTY = {
  client: "",
  title: QUOTE_OPTIONS.titles[0],
  quantity: "500",
  paperType: QUOTE_OPTIONS.paperTypes[0],
  gsm: QUOTE_OPTIONS.gsm[0],
  printing: QUOTE_OPTIONS.printing[0],
  binding: QUOTE_OPTIONS.binding[0],
  finishing: QUOTE_OPTIONS.finishing[0],
};

export default function CreateQuoteDialog({ open, onClose, onConvert, onSend }) {
  const [values, setValues] = useState(EMPTY);

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function handleClose() {
    setValues(EMPTY);
    onClose();
  }

  const { lines, discountPercent } = QUOTE_COSTS;
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const subtotalPerBook = lines.reduce((sum, l) => sum + l.perBook, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const gst = Math.round((subtotal - discount) * 0.18);
  const grandTotal = subtotal - discount + gst;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Quote"
      width={950}
      footer={
        <div className="flex flex-1 items-center justify-end gap-3">
          <Button variant="primary" onClick={() => onConvert?.(values)}>
            Convert to Order
          </Button>
          <Button variant="secondary" onClick={() => onSend?.(values)}>
            Send to Client
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          <SelectField
            label="Client"
            options={CLIENTS.map((c) => c.name)}
            value={values.client}
            onChange={set("client")}
          />
          <SelectField
            label="Title"
            options={QUOTE_OPTIONS.titles}
            placeholder="Job name"
            value={values.title}
            onChange={set("title")}
          />
          <TextField
            label="Quantity"
            type="number"
            min="1"
            value={values.quantity}
            onChange={set("quantity")}
          />
          <SelectField
            label="Paper Type"
            options={QUOTE_OPTIONS.paperTypes}
            value={values.paperType}
            onChange={set("paperType")}
          />
          <SelectField
            label="GSM"
            options={QUOTE_OPTIONS.gsm}
            value={values.gsm}
            onChange={set("gsm")}
          />
          <SelectField
            label="Printing"
            options={QUOTE_OPTIONS.printing}
            value={values.printing}
            onChange={set("printing")}
          />
          <SelectField
            label="Binding"
            options={QUOTE_OPTIONS.binding}
            value={values.binding}
            onChange={set("binding")}
          />
          <SelectField
            label="Finishing"
            options={QUOTE_OPTIONS.finishing}
            value={values.finishing}
            onChange={set("finishing")}
          />
        </div>

        <div className="rounded-md border border-border-default p-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-2 text-left font-medium text-tertiary">Cost head</th>
                <th className="py-2 text-right font-medium text-tertiary">Per Book</th>
                <th className="py-2 text-right font-medium text-tertiary">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.head} className="border-b border-border-subtle">
                  <td className="py-2 text-primary">{line.head}</td>
                  <td className="tabular py-2 text-right text-primary">
                    {formatINR(line.perBook)}
                  </td>
                  <td className="tabular py-2 text-right text-primary">
                    {formatINR(line.total)}
                  </td>
                </tr>
              ))}

              <tr className="border-b border-border-subtle">
                <td className="py-2 font-medium text-primary">Subtotal</td>
                <td className="tabular py-2 text-right font-medium text-primary">
                  {formatINR(subtotalPerBook)}
                </td>
                <td className="tabular py-2 text-right font-medium text-primary">
                  {formatINR(subtotal)}
                </td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="py-2 font-medium text-primary">
                  Discount {discountPercent}%
                </td>
                <td />
                <td className="tabular py-2 text-right text-primary">
                  -{formatINR(discount)}
                </td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="py-2 font-medium text-primary">GST (18%)</td>
                <td />
                <td className="tabular py-2 text-right text-primary">
                  {formatINR(gst)}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-lg font-medium text-primary">Grand Total</td>
                <td />
                <td className="tabular py-3 text-right text-lg font-semibold text-on-brand">
                  {formatINR(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
