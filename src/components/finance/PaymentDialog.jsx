import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import PaymentFields from "./PaymentFields.jsx";
import { CLIENTS } from "../../data/clients.js";

/**
 * PaymentDialog
 * -----------------------------------------------------------------------------
 * One dialog, three modes, rather than three near-duplicate components - the
 * three Figma frames differ only in which fields are editable and which
 * buttons sit in the footer, and `PaymentFields` already carries the part
 * that's identical across all of them.
 *
 *   mode="add"     Add Payment    node 1180:36020 - Client/Order pickers,
 *                  editable fields, footer: Add Payment (success) / Cancel
 *   mode="verify"  Verify Payment node 1180:36066 - no pickers (already
 *                  scoped to `payment`), editable fields pre-filled from the
 *                  row, footer stacked: Verify (success) / Cancel /
 *                  Reject (danger outline)
 *   mode="view"    View           inside node 1180:36096 - no pickers,
 *                  read-only fields, footer: Close
 *
 * `payment` is required for verify/view (the row being acted on) and unused
 * for add.
 *
 * STATE: seeded once from props via lazy useState initialisers, not an effect
 * that calls setState on `payment` changing - that pattern causes a
 * cascading-render lint failure (see ClientDetailDialog for the same fix).
 * Instead, FinancePage remounts this component with `key={mode + payment.id}`
 * whenever a different row or mode is opened, so a fresh mount is exactly a
 * fresh seed - no effect required.
 */

const TITLES = {
  add: "Add Payment",
  verify: "Verify Payment",
  view: "View",
};

export default function PaymentDialog({
  mode,
  open,
  onClose,
  payment,
  orderOptions = [],
  onSave,
  onVerify,
  onReject,
}) {
  const [client, setClient] = useState("");
  const [order, setOrder] = useState("");
  const [values, setValues] = useState(() =>
    mode === "add"
      ? { paymentDue: "", paymentRef: "", amount: "", billNo: "" }
      : {
          // != null, not a truthy check: due is legitimately 0 on a fully
          // paid row, and 0 is falsy in JS - a truthy check would render an
          // empty field for exactly the rows that most need to show "0".
          paymentDue: payment?.due != null ? String(payment.due) : "",
          paymentRef: payment?.paymentRef ?? "",
          amount: payment?.due != null ? String(payment.due) : "",
          billNo: payment?.billNo ?? "",
        }
  );
  const [proofName, setProofName] = useState(
    mode === "add" ? "" : (payment?.proofName ?? "")
  );

  function setField(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const footer =
    mode === "add" ? (
      <>
        <Button
          variant="success"
          size="lg"
          className="flex-1"
          onClick={() => onSave?.({ client, order, ...values, proofName })}
        >
          Add Payment
        </Button>
        <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </>
    ) : mode === "verify" ? (
      // Vertically stacked, per Figma - distinct from every other dialog's
      // horizontal footer, and the only one carrying a destructive action.
      <div className="flex w-full flex-col gap-3">
        <Button variant="success" size="lg" onClick={() => onVerify?.(payment, values)}>
          Verify
        </Button>
        <Button variant="secondary" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="dangerOutline" size="lg" onClick={() => onReject?.(payment)}>
          Reject
        </Button>
      </div>
    ) : (
      <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
        Close
      </Button>
    );

  return (
    <Modal open={open} onClose={onClose} title={TITLES[mode]} footer={footer}>
      <PaymentFields
        mode={mode}
        clientOptions={CLIENTS.map((c) => c.name)}
        orderOptions={orderOptions}
        client={client}
        order={order}
        onClientChange={setClient}
        onOrderChange={setOrder}
        values={values}
        onFieldChange={setField}
        proofName={proofName}
        onProofChange={setProofName}
      />
    </Modal>
  );
}
