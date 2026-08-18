import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { TextField, SelectField, RadioGroup } from "../ui/TextField.jsx";
import { CITIES } from "../../data/clients.js";

/**
 * Add Vendor dialog
 * Figma: FINAL SCREENS / Shivalik / Group 7 (node 790:22655)
 *
 * Same layout as Add Client, with three differences: "Contact Name" rather
 * than "Contact Person", "Vendor ID" rather than "Customer ID", and a Vendor
 * Type radio group (Printing / Binding) - which is the real distinction, since
 * printing and binding vendors sit at different stages of the job.
 */

const VENDOR_TYPES = ["Printing", "Binding"];

const EMPTY = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  city: "",
  vendorId: "",
  vendorType: "Printing",
};

export default function AddVendorDialog({ open, onClose, onSave }) {
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
      title="Add Vendor"
      footer={
        <>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSave}>
            Save Vendor
          </Button>
          <Button variant="brandSubtle" size="lg" className="flex-1">
            Send Details to Mobile
          </Button>
          <Button variant="secondary" size="lg" className="flex-1" onClick={handleClose}>
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
            label="Contact Name"
            className="flex-1"
            value={values.contactName}
            onChange={set("contactName")}
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
            label="Vendor ID"
            className="flex-1"
            action="Auto-generate"
            value={values.vendorId}
            onChange={set("vendorId")}
            onAction={() =>
              setValues((v) => ({
                ...v,
                vendorId: `VD-${Math.floor(1000 + Math.random() * 9000)}`,
              }))
            }
          />
        </div>

        <RadioGroup
          label="Vendor Type"
          name="vendorType"
          options={VENDOR_TYPES}
          value={values.vendorType}
          onChange={(vendorType) => setValues((v) => ({ ...v, vendorType }))}
        />
      </div>
    </Modal>
  );
}
