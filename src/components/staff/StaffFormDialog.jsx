import { useRef, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { TextField, SelectField } from "../ui/TextField.jsx";
import { ROLES } from "../../data/staff.js";

/**
 * StaffFormDialog
 * -----------------------------------------------------------------------------
 * Add Staff Member (node 1181:84993) and Edit Staff Member (node 1181:85085)
 * are the same six fields in the same layout, empty vs. pre-filled - one
 * component parameterised by `mode`, same construction as `PaymentDialog`
 * for the Finance dialogs.
 *
 * Contract is a file picker, but a compact one - a single labelled row
 * showing "Upload" or the chosen filename, not the large dashed drop zone
 * Finance's Proof field uses (`FileDropzone`). Rather than build a second
 * upload primitive for a different visual weight, this reuses `TextField`'s
 * existing inline-action slot (the same slot "Verify" and "Auto-generate"
 * already use) with a real hidden file input behind the action button.
 *
 * STATE: seeded via a useState initialiser, not an effect - StaffPage
 * remounts this with `key={mode + staff?.id}` when a different row or mode
 * opens. Same fix as PaymentDialog/ClientDetailDialog.
 */

const EMPTY = { name: "", role: "", phone: "", email: "", address: "" };

const TITLES = { add: "Add Staff Member", edit: "Edit Staff Member" };

export default function StaffFormDialog({ mode, open, onClose, staff, onSave }) {
  const [values, setValues] = useState(() =>
    mode === "edit" && staff
      ? {
          name: staff.name,
          role: staff.role,
          phone: staff.phone,
          email: staff.email,
          address: staff.address ?? "",
        }
      : EMPTY
  );
  const [contractFile, setContractFile] = useState(
    mode === "edit" ? (staff?.contractFile ?? "") : ""
  );
  const fileInputRef = useRef(null);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLES[mode]}
      width={1052}
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onSave?.({ ...values, contractFile })}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-6">
          <TextField label="Name" value={values.name} onChange={set("name")} />
          <SelectField
            label="Role"
            placeholder="Select Role"
            options={ROLES}
            value={values.role}
            onChange={set("role")}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <TextField label="Phone" type="tel" value={values.phone} onChange={set("phone")} />
          <TextField label="Email" type="email" value={values.email} onChange={set("email")} />
        </div>

        <TextField label="Address" value={values.address} onChange={set("address")} />

        <TextField
          label="Contract"
          value={contractFile}
          placeholder="Upload"
          readOnly
          action="Upload"
          onAction={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={(e) => setContractFile(e.target.files?.[0]?.name ?? "")}
        />
      </div>
    </Modal>
  );
}
