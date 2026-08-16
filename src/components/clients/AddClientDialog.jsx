import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { TextField, SelectField } from "../ui/TextField.jsx";
import { CITIES } from "../../data/clients.js";

/**
 * Add Client dialog
 * Figma: FINAL SCREENS / Shivalik / Group 29 (node 790:56541), modal 790:56543
 *
 * Two-column field grid, three actions.
 *
 * COPY FIX: the Figma primary action reads "Save Vendor" on a dialog titled
 * "Add Client" - carried over from the vendor dialog it was duplicated from.
 * Rendered here as "Save Client"; see src/README.md for the list of design
 * placeholders that were deliberately not reproduced.
 */

const EMPTY = {
  businessName: "",
  contactPerson: "",
  phone: "",
  email: "",
  city: "",
  customerId: "",
};

export default function AddClientDialog({ open, onClose, onSave }) {
  const [values, setValues] = useState(EMPTY);

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function handleClose() {
    setValues(EMPTY);
    onClose();
  }

  function handleSave() {
    onSave?.(values);
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Client"
      footer={
        <>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSave}
          >
            Save Client
          </Button>
          <Button variant="brandSubtle" size="lg" className="flex-1">
            Send Details to Mobile
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-6">
          <TextField
            label="Business Name"
            className="flex-1"
            value={values.businessName}
            onChange={set("businessName")}
          />
          <TextField
            label="Contact Person"
            className="flex-1"
            value={values.contactPerson}
            onChange={set("contactPerson")}
          />
        </div>

        <div className="flex gap-6">
          <TextField
            label="Phone"
            type="tel"
            className="flex-1"
            action="Verify"
            value={values.phone}
            onChange={set("phone")}
          />
          <TextField
            label="Email"
            type="email"
            className="flex-1"
            action="Verify"
            value={values.email}
            onChange={set("email")}
          />
        </div>

        <div className="flex gap-6">
          <SelectField
            label="City"
            className="flex-1"
            options={CITIES}
            value={values.city}
            onChange={set("city")}
          />
          <TextField
            label="Customer ID"
            className="flex-1"
            action="Auto-generate"
            value={values.customerId}
            onChange={set("customerId")}
            onAction={() =>
              setValues((v) => ({
                ...v,
                customerId: `VN-${Math.floor(1000 + Math.random() * 9000)}`,
              }))
            }
          />
        </div>
      </div>
    </Modal>
  );
}
