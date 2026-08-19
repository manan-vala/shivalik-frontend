import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { SelectField, TextField } from "../ui/TextField.jsx";
import { COURIERS } from "../../data/orders.js";

/**
 * Confirm Dispatch dialog
 * Figma: GOLDEN / Orders (node 1180:51138)
 *
 * Opens from the Dispatch button on a "Ready For Dispatch" row. Title carries
 * the order's own id, the construction TicketDetailDialog and AssignStock
 * already use.
 *
 * The delivery address is prefilled from the order rather than left blank -
 * the frame shows it filled in ("Aakash Enterprise, Delhi, 40001"), and it is
 * the client's address, not something the operator should retype.
 */
export default function ConfirmDispatchDialog({ order, open, onClose, onConfirm }) {
  const [values, setValues] = useState(() => ({
    courier: "",
    address: order?.deliveryAddress ?? "",
    expected: "",
    driver: "",
  }));

  if (!order) return null;

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      // The frame drops the "ORD-" hyphen in the title only ("Confirm
      // Dispatch - ORD 5002"); the id itself is unchanged.
      title={`Confirm Dispatch - ${order.id.replace("-", " ")}`}
      width={550}
      showCloseButton
      footer={
        <div className="flex flex-1 justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onConfirm?.(order.id, values)}
          >
            Confirm Dispatch
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <SelectField
          label="Courier/Transport"
          placeholder="Select courier"
          options={COURIERS}
          value={values.courier}
          onChange={set("courier")}
        />

        <TextField
          label="Delivery Address"
          value={values.address}
          onChange={set("address")}
        />

        <div className="flex gap-6">
          <TextField
            label="Expected Delivery"
            type="date"
            className="flex-1"
            value={values.expected}
            onChange={set("expected")}
          />
          <TextField
            label="Driver / Contract"
            placeholder="Name"
            className="flex-1"
            value={values.driver}
            onChange={set("driver")}
          />
        </div>
      </div>
    </Modal>
  );
}
