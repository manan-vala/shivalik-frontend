import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import { TextField, Textarea } from "../ui/TextField.jsx";

/**
 * Add / Edit Vendor dialog
 *
 * One dialog, two modes, matching the backend's `Vendor` model exactly —
 * `is_blocked` is not here because the serializer marks it read-only; a
 * vendor is blocked or unblocked from the row action on VendorsPage, which
 * calls the dedicated endpoint (and writes an audit row the way this form
 * never could).
 *
 * `categories_supplied` is a JSON list on the backend; the model's own
 * help text says "the UI collects them comma-separated", so that's the
 * text field here, split/joined at the edges.
 *
 * STATE: lazy-seeded from `vendor`, remounted by the parent via
 * `key={mode + vendor?.id}` rather than an effect — the same pattern every
 * dialog in this app uses.
 */

const TITLES = { add: "Add Vendor", edit: "Edit Vendor" };
const SAVE_LABELS = { add: "Save Vendor", edit: "Save Changes" };

const EMPTY = {
  company_name: "",
  vendor_name: "",
  gst_number: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  categories: "",
  expected_delivery_days: "",
  payment_terms: "",
  notes: "",
};

function seed(mode, vendor) {
  if (mode !== "edit" || !vendor) return EMPTY;
  return {
    company_name: vendor.company_name ?? "",
    vendor_name: vendor.vendor_name ?? "",
    gst_number: vendor.gst_number ?? "",
    contact_person: vendor.contact_person ?? "",
    phone: vendor.phone ?? "",
    email: vendor.email ?? "",
    address: vendor.address ?? "",
    categories: (vendor.categories_supplied ?? []).join(", "),
    expected_delivery_days: vendor.expected_delivery_days ?? "",
    payment_terms: vendor.payment_terms ?? "",
    notes: vendor.notes ?? "",
  };
}

function toPayload(values) {
  return {
    company_name: values.company_name.trim(),
    vendor_name: values.vendor_name.trim(),
    gst_number: values.gst_number.trim(),
    contact_person: values.contact_person.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    categories_supplied: values.categories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    expected_delivery_days: values.expected_delivery_days === "" ? null : Number(values.expected_delivery_days),
    payment_terms: values.payment_terms.trim(),
    notes: values.notes.trim(),
  };
}

export default function VendorFormDialog({ mode = "add", vendor, open, onClose, onSaved }) {
  const [values, setValues] = useState(() => seed(mode, vendor));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSave() {
    if (!values.company_name.trim() || !values.vendor_name.trim() || !values.gst_number.trim()) {
      setError("Company name, vendor name and GSTIN are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSaved(toPayload(values));
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
      width={846}
      showCloseButton
      footer={
        <>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : SAVE_LABELS[mode]}
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
            <TextField
              label="Company Name"
              className="flex-1"
              value={values.company_name}
              onChange={set("company_name")}
            />
            <TextField
              label="Vendor Name"
              className="flex-1"
              value={values.vendor_name}
              onChange={set("vendor_name")}
            />
          </div>

          <div className="flex gap-6">
            <TextField
              label="GSTIN"
              className="flex-1"
              placeholder="22AAAAA0000A1Z5"
              value={values.gst_number}
              onChange={set("gst_number")}
            />
            <TextField
              label="Contact Person"
              className="flex-1"
              value={values.contact_person}
              onChange={set("contact_person")}
            />
          </div>

          <div className="flex gap-6">
            <TextField label="Phone" type="tel" className="flex-1" value={values.phone} onChange={set("phone")} />
            <TextField label="Email" type="email" className="flex-1" value={values.email} onChange={set("email")} />
          </div>

          <TextField label="Address" value={values.address} onChange={set("address")} />

          <div className="flex gap-6">
            <TextField
              label="Categories Supplied"
              className="flex-1"
              placeholder="Fiction, Engineering"
              value={values.categories}
              onChange={set("categories")}
            />
            <TextField
              label="Expected Delivery (days)"
              type="number"
              min="0"
              className="flex-1"
              value={values.expected_delivery_days}
              onChange={set("expected_delivery_days")}
            />
          </div>

          <TextField
            label="Payment Terms"
            placeholder="Net 30"
            value={values.payment_terms}
            onChange={set("payment_terms")}
          />

          <Textarea label="Notes" value={values.notes} onChange={set("notes")} />

          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </fieldset>
    </Modal>
  );
}
