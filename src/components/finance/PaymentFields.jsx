import { TextField, SelectField } from "../ui/TextField.jsx";
import FileDropzone from "../ui/FileDropzone.jsx";

/**
 * PaymentFields
 * -----------------------------------------------------------------------------
 * The field set shared by all three payment dialogs - Add Payment, Verify
 * Payment, and View (nodes 1180:36020, 1180:36066, and the read-only dialog
 * inside 1180:36096). All three show the same five fields in the same order;
 * they differ only in whether Client/Order pickers sit above them and whether
 * the fields are editable. That shape lives here once, and `PaymentDialog`
 * composes it per mode rather than three near-duplicate field blocks existing
 * in three separate files.
 *
 *   Client + Order  (Add only - the other two are already scoped to a row)
 *   Payment Due
 *   Payment Ref / UTR
 *   Enter Amount (for partial)
 *   Proof            (upload zone, or a filename / "none" in read-only)
 *   Bill No (if any)
 */
export default function PaymentFields({
  mode,
  clientOptions = [],
  orderOptions = [],
  client,
  order,
  onClientChange,
  onOrderChange,
  values,
  onFieldChange,
  proofName,
  onProofChange,
}) {
  const readOnly = mode === "view";
  const set = (key) => (e) => onFieldChange(key, e.target.value);
  // "Type..." reads as an invitation to edit - wrong once the field can't be
  // edited. An empty read-only field just reads as empty instead.
  const placeholder = (text) => (readOnly ? undefined : text);

  return (
    <div className="flex flex-col gap-2.5">
      {mode === "add" && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          <SelectField
            label="Client"
            options={clientOptions}
            value={client}
            onChange={(e) => onClientChange(e.target.value)}
          />
          <SelectField
            label="Order"
            options={orderOptions}
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
            disabled={orderOptions.length === 0}
          />
        </div>
      )}

      <TextField
        label="Payment Due"
        placeholder={placeholder("Type...")}
        value={values.paymentDue}
        onChange={set("paymentDue")}
        readOnly={readOnly}
      />

      <TextField
        label="Payment Ref / UTR"
        placeholder={placeholder("Type...")}
        value={values.paymentRef}
        onChange={set("paymentRef")}
        readOnly={readOnly}
      />

      <TextField
        label="Enter Amount (for partial)"
        placeholder={placeholder("Type..")}
        value={values.amount}
        onChange={set("amount")}
        readOnly={readOnly}
      />

      <div className="flex flex-col gap-2">
        <p className="text-md font-semibold text-tertiary">Proof</p>
        <FileDropzone
          label="Proof"
          fileName={proofName}
          onChange={onProofChange}
          readOnly={readOnly}
        />
      </div>

      <TextField
        label="Bill No (if any)"
        placeholder={placeholder("Type...")}
        value={values.billNo}
        onChange={set("billNo")}
        readOnly={readOnly}
      />
    </div>
  );
}
