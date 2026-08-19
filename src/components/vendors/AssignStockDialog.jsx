import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { SelectField, TextField } from "../ui/TextField.jsx";
import { MATERIALS } from "../../data/vendors.js";

/**
 * Assign Stock dialog
 * Figma: GOLDEN / Vendors / Frame 279 (node 1180:48141)
 *
 * Title carries the vendor's own name ("Assign stock to Bharat Offset
 * Printers"), the same construction as TicketDetailDialog's title.
 *
 * The "Current Stock" panel is read-only context for the assignment below it;
 * it is the only place in the file that shows what a vendor's stock consists
 * of, so `data/vendors.js` takes its material list from here.
 *
 * DEVIATION: Figma labels this panel's rows in #808080 and #666 - two greys
 * that are not in the token set (the nearest role, `text-tertiary`, is
 * Gray/500 #667085). Rendered with the token roles so the panel stays inside
 * the type/colour system rather than pinning two one-off hex values.
 */

// One blank material row is what the frame shows; "Add Material" appends more.
const BLANK_ROW = { material: "", quantity: "" };

export default function AssignStockDialog({ vendor, open, onClose, onAssign }) {
  const [rows, setRows] = useState([BLANK_ROW]);

  if (!vendor) return null;

  function update(index, key) {
    return (e) =>
      setRows((list) =>
        list.map((row, i) => (i === index ? { ...row, [key]: e.target.value } : row))
      );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign stock to ${vendor.name}`}
      width={770}
      showCloseButton
      footer={
        <div className="flex flex-1 justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onAssign?.(vendor.id, rows)}
          >
            Assign Stock
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Current Stock - read-only panel, radius 16 and a hairline border
            rather than the app's usual card, matching node 1180:48145. */}
        <section className="rounded-xl border border-border-default">
          <h3 className="p-2.5 text-md font-semibold text-tertiary">
            Current Stock
          </h3>
          <dl className="flex flex-col gap-1.5 border-t border-border-default p-2.5">
            {vendor.stock.map((item) => (
              <div
                key={item.material}
                className="flex items-center justify-between py-1"
              >
                <dt className="text-sm font-bold text-tertiary">
                  {item.material}
                </dt>
                <dd className="m-0 text-sm font-medium text-primary">
                  {item.quantity}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {rows.map((row, i) => (
          <div key={i} className="flex gap-6">
            <SelectField
              label="Material"
              className="flex-1"
              options={MATERIALS}
              value={row.material}
              onChange={update(i, "material")}
            />
            <TextField
              label="Quantity"
              className="flex-1"
              inputMode="numeric"
              value={row.quantity}
              onChange={update(i, "quantity")}
            />
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            variant="brandSubtle"
            size="sm"
            iconLeading="plus"
            onClick={() => setRows((list) => [...list, BLANK_ROW])}
          >
            Add Material
          </Button>
        </div>
      </div>
    </Modal>
  );
}
