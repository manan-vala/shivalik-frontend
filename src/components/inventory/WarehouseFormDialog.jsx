import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import { TextField, Textarea } from "../ui/TextField.jsx";

/**
 * Add / Edit Warehouse
 *
 * `is_active` is not a field here on purpose — see InventoryPage's
 * "Deactivate"/"Activate" row action, which is the model's own documented
 * path ("deactivate rather than delete") and carries its own confirmation,
 * the way Vendor's block/unblock does.
 */

const TITLES = { add: "Add Warehouse", edit: "Edit Warehouse" };

const EMPTY = { name: "", code: "", location: "", description: "" };

function seed(mode, warehouse) {
  if (mode !== "edit" || !warehouse) return EMPTY;
  return {
    name: warehouse.name ?? "",
    code: warehouse.code ?? "",
    location: warehouse.location ?? "",
    description: warehouse.description ?? "",
  };
}

export default function WarehouseFormDialog({ mode = "add", warehouse, open, onClose, onSaved }) {
  const [values, setValues] = useState(() => seed(mode, warehouse));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSave() {
    if (!values.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSaved({
        name: values.name.trim(),
        code: values.code.trim(),
        location: values.location.trim(),
        description: values.description.trim(),
      });
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
      width={640}
      showCloseButton
      footer={
        <>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
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
            <TextField label="Name" className="flex-1" value={values.name} onChange={set("name")} />
            <TextField
              label="Code"
              className="flex-1"
              placeholder="WH-001"
              value={values.code}
              onChange={set("code")}
            />
          </div>
          <TextField label="Location" value={values.location} onChange={set("location")} />
          <Textarea label="Description" value={values.description} onChange={set("description")} />
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </fieldset>
    </Modal>
  );
}
