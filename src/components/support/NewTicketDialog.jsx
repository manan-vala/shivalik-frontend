import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { SelectField, TextField, Textarea, RadioGroup } from "../ui/TextField.jsx";
import { CLIENTS } from "../../data/clients.js";
import {
  RAISED_FOR,
  CATEGORIES,
  SUBCATEGORIES,
  PRIORITIES,
} from "../../data/support.js";

/**
 * New Ticket dialog
 * Figma: FINAL SCREENS / Shivalik Final / Group 49/50/51/52
 *   (nodes 1180:37549/37567 "Self", 37586 "Client", 37608 "Vendor")
 *
 * One dialog, not three - the three frames are the same form with "Raising a
 * ticket for?" set to each of its three options, which is exactly what the
 * `for` state below drives: Self shows no extra fields, Client/Vendor each
 * reveal a picker plus an Order picker.
 */

const EMPTY = {
  for: "Self",
  client: "",
  vendor: "",
  order: "",
  subject: "",
  body: "",
  category: "",
  subcategory: "",
  priority: "Medium",
};

export default function NewTicketDialog({ open, onClose, onCreate }) {
  const [values, setValues] = useState(EMPTY);

  function reset() {
    setValues(EMPTY);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function set(key) {
    return (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Ticket"
      width={621}
      showCloseButton
      footer={
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => {
            onCreate?.(values);
            reset();
          }}
        >
          Add Ticket
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <SelectField
          label="Raising a ticket for?"
          options={RAISED_FOR}
          value={values.for}
          onChange={set("for")}
        />

        {values.for === "Client" && (
          <div className="grid grid-cols-2 gap-6">
            <SelectField
              label="Client"
              options={CLIENTS.map((c) => c.name)}
              value={values.client}
              onChange={set("client")}
            />
            <SelectField
              label="Order"
              options={[]}
              value={values.order}
              onChange={set("order")}
              disabled
            />
          </div>
        )}

        {values.for === "Vendor" && (
          <div className="grid grid-cols-2 gap-6">
            <SelectField
              label="Vendor"
              options={[]}
              placeholder="Select Vendor"
              value={values.vendor}
              onChange={set("vendor")}
              disabled
            />
            <SelectField
              label="Order"
              options={[]}
              value={values.order}
              onChange={set("order")}
              disabled
            />
          </div>
        )}

        <TextField
          label="Subject"
          placeholder="Message title"
          value={values.subject}
          onChange={set("subject")}
        />

        <Textarea
          label="Body"
          maxLength={320}
          rows={4}
          placeholder="Your message..."
          value={values.body}
          onChange={set("body")}
        />

        <SelectField
          label="Category"
          placeholder="Select category"
          options={CATEGORIES}
          value={values.category}
          onChange={set("category")}
        />

        <SelectField
          label="Subcategory"
          placeholder="Select subcategory"
          options={SUBCATEGORIES}
          value={values.subcategory}
          onChange={set("subcategory")}
        />

        <RadioGroup
          label="Priority"
          name="priority"
          layout="vertical"
          options={PRIORITIES}
          value={values.priority}
          onChange={(priority) => setValues((v) => ({ ...v, priority }))}
        />
      </div>
    </Modal>
  );
}
