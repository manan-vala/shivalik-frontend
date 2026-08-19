import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { SelectField } from "../ui/TextField.jsx";
import { VENDORS } from "../../data/vendors.js";

/**
 * Assign Vendors dialog
 * Figma: GOLDEN / Orders (node 1180:51117)
 *
 * Picks the printing and binding vendor for an order. The two selects are
 * filtered by specialisation off the vendor list rather than hardcoded, so a
 * binding vendor can never be assigned to the printing slot.
 *
 * Three actions: Send Request asks the vendors to accept, Auto Approve skips
 * that step, Cancel dismisses.
 */

const printingVendors = () =>
  VENDORS.filter((v) => v.specialization === "printing").map((v) => v.name);

const bindingVendors = () =>
  VENDORS.filter((v) => v.specialization === "binding").map((v) => v.name);

export default function AssignVendorsDialog({
  order,
  open,
  onClose,
  onSend,
  onAutoApprove,
}) {
  const [printing, setPrinting] = useState("");
  const [binding, setBinding] = useState("");

  if (!order) return null;

  const values = { printing, binding };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Vendors"
      width={450}
      showCloseButton
      footer={
        <>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onSend?.(order.id, values)}
          >
            Send Request
          </Button>
          <Button
            variant="brandSubtle"
            size="lg"
            onClick={() => onAutoApprove?.(order.id, values)}
          >
            Auto Approve
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SelectField
          label="Printing Vendor"
          placeholder="Select Printing Vendor"
          options={printingVendors()}
          value={printing}
          onChange={(e) => setPrinting(e.target.value)}
        />
        <SelectField
          label="Binding Vendor"
          placeholder="Select Binding Vendor"
          options={bindingVendors()}
          value={binding}
          onChange={(e) => setBinding(e.target.value)}
        />
      </div>
    </Modal>
  );
}
