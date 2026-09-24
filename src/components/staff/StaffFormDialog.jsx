import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import { TextField, SelectField } from "../ui/TextField.jsx";
import { ROLE_OPTIONS } from "../../lib/api/staff.js";

/**
 * Add / Edit Staff Member
 *
 * Matches `Employee` exactly. Two fields the earlier mock had are gone:
 *
 *   - `contract`: the serializer marks it read-only ("handled separately,
 *     multipart") and no endpoint accepts a multipart upload for it, so
 *     there is no request this form could make that would do anything.
 *   - password on edit: nothing in this API resets one, so an edit never
 *     asks for it. A new hire's password is set once, on `POST staff/`.
 *
 * A new hire lands `Pending` regardless of who creates them (the backend
 * has one approval path) — this form doesn't pretend otherwise; approving
 * is a separate action on the row/detail view once they exist.
 *
 * STATE: lazy-seeded, remounted by the parent via `key={mode + staff?.id}` —
 * the pattern every dialog in this app uses.
 */

const TITLES = { add: "Add Staff Member", edit: "Edit Staff Member" };

const EMPTY = {
  name: "",
  email: "",
  password: "",
  role: "",
  phone: "",
  department: "",
  address: "",
  salary: "",
};

function seed(mode, staff) {
  if (mode !== "edit" || !staff) return EMPTY;
  return {
    name: staff.name ?? "",
    email: staff.email ?? "",
    password: "",
    role: staff.role ?? "",
    phone: staff.phone ?? "",
    department: staff.department ?? "",
    address: staff.address ?? "",
    salary: staff.salary ?? "",
  };
}

export default function StaffFormDialog({ mode = "add", staff, open, onClose, onSaved }) {
  const [values, setValues] = useState(() => seed(mode, staff));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = mode === "edit";

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSave() {
    if (!values.name.trim() || !values.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!isEdit && !values.password) {
      setError("Choose a password for the new account.");
      return;
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role || null,
      phone: values.phone.trim(),
      department: values.department.trim(),
      address: values.address.trim(),
      salary: values.salary === "" ? null : values.salary,
    };
    if (!isEdit) payload.password = values.password;

    setSaving(true);
    setError("");
    try {
      await onSaved(payload);
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
      width={1052}
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <fieldset disabled={saving} className="contents">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-6">
            <TextField label="Name" value={values.name} onChange={set("name")} />
            <TextField label="Email" type="email" value={values.email} onChange={set("email")} disabled={isEdit} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {!isEdit && (
              <TextField
                label="Password"
                type="password"
                value={values.password}
                onChange={set("password")}
              />
            )}
            <SelectField
              label="Role"
              placeholder="Select Role"
              options={ROLE_OPTIONS.map((r) => r.label)}
              value={ROLE_OPTIONS.find((r) => r.value === values.role)?.label ?? ""}
              onChange={(e) => {
                const chosen = ROLE_OPTIONS.find((r) => r.label === e.target.value);
                setValues((v) => ({ ...v, role: chosen?.value ?? "" }));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <TextField label="Phone" type="tel" value={values.phone} onChange={set("phone")} />
            <TextField label="Department" value={values.department} onChange={set("department")} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <TextField label="Address" value={values.address} onChange={set("address")} />
            <TextField label="Salary" type="number" min="0" value={values.salary} onChange={set("salary")} />
          </div>

          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </fieldset>
    </Modal>
  );
}
