import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import {
  TextField,
  SelectField,
  CheckboxGroup,
} from "../ui/TextField.jsx";
import {
  VENDOR_CITIES,
  VENDOR_TYPES,
  VENDOR_STATUS_OPTIONS,
  VENDOR_STATUS,
} from "../../data/vendors.js";

/**
 * Add / Edit Vendor dialog
 * Figma: GOLDEN / Vendors
 *   Add Vendor  (node 1180:48049)
 *   Edit Vendor (node 1180:48090)
 *
 * One dialog, two modes - the same six fields in the same 2-up grid; Edit adds
 * a Status select, prefills from the row, and greys the inline Verify /
 * Auto-generate actions. Same construction as StaffFormDialog.
 *
 * SUPERSEDES the older Add Vendor frame (Shivalik file, node 790:22655) that
 * `AddVendorDialog` was built from. That frame had a Printing/Binding *radio*
 * group and a three-button footer ("Save Vendor / Send Details to Mobile /
 * Cancel"); this one uses checkboxes - a vendor can do both, and both boxes
 * are ticked in the frame - and a two-button footer. The Dashboard's Add
 * Vendor action now opens this dialog, so the app has one vendor form rather
 * than two that disagree.
 *
 * STATE: lazy-seeded from `vendor`, remounted by the parent via
 * `key={mode + vendor?.id}` rather than an effect - the ClientDetailDialog
 * pattern.
 */

const TITLES = { add: "Add Vendor", edit: "Edit Vendor" };
const SAVE_LABELS = { add: "Save Vendor", edit: "Save Changes" };

const EMPTY = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  city: "",
  vendorId: "",
  vendorTypes: ["Printing"],
  status: VENDOR_STATUS_OPTIONS[0],
};

function seed(mode, vendor) {
  if (mode !== "edit" || !vendor) return EMPTY;
  return {
    businessName: vendor.name,
    contactName: vendor.contact ?? "",
    phone: vendor.phone ?? "",
    email: vendor.email ?? "",
    city: vendor.city ?? "",
    vendorId: vendor.id,
    vendorTypes: [SPECIALIZATION_LABEL[vendor.specialization]].filter(Boolean),
    status: VENDOR_STATUS[vendor.status]?.label ?? VENDOR_STATUS_OPTIONS[0],
  };
}

// The list stores one specialization per vendor while the form offers both as
// checkboxes, so the single value is widened into the array the group expects.
const SPECIALIZATION_LABEL = { printing: "Printing", binding: "Binding" };

export default function VendorFormDialog({
  mode = "add",
  vendor,
  open,
  onClose,
  onSave,
}) {
  const [values, setValues] = useState(() => seed(mode, vendor));
  const isEdit = mode === "edit";

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLES[mode]}
      width={846}
      showCloseButton
      footer={
        <>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => onSave?.(mode, values)}
          >
            {SAVE_LABELS[mode]}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
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
            actionDisabled={isEdit}
            value={values.phone}
            onChange={set("phone")}
          />
          <TextField
            label="Email"
            type="email"
            className="flex-1"
            action="Verify"
            actionDisabled={isEdit}
            value={values.email}
            onChange={set("email")}
          />
        </div>

        <div className="flex gap-6">
          <SelectField
            label="City"
            className="flex-1"
            options={VENDOR_CITIES}
            value={values.city}
            onChange={set("city")}
          />
          <TextField
            label="Vendor ID"
            className="flex-1"
            action="Auto-generate"
            actionDisabled={isEdit}
            value={values.vendorId}
            onChange={set("vendorId")}
            onAction={() =>
              setValues((v) => ({
                ...v,
                vendorId: `VN-${Math.floor(1000 + Math.random() * 9000)}`,
              }))
            }
          />
        </div>

        <CheckboxGroup
          label="Vendor Type"
          name="vendorType"
          options={VENDOR_TYPES}
          value={values.vendorTypes}
          onChange={(vendorTypes) => setValues((v) => ({ ...v, vendorTypes }))}
        />

        {isEdit && (
          <SelectField
            label="Status"
            options={VENDOR_STATUS_OPTIONS}
            value={values.status}
            onChange={set("status")}
          />
        )}
      </div>
    </Modal>
  );
}
