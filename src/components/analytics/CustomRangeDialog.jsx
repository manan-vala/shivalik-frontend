import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { TextField } from "../ui/TextField.jsx";

/**
 * "Customise your analytics" dialog
 * Figma: the "Custom" frame, drawn once per Analytics screen -
 *   Sales 1180:53577, Operational 1180:55034, Financial 1180:55069.
 *
 * All three frames are byte-identical (same name, same children, same 678x313
 * box); they are the same dialog repeated per page, not three designs. One
 * component, opened from `AnalyticsLayout`.
 */
export default function CustomRangeDialog({ open, onClose, onPublish }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customise your analytics"
      width={678}
      showCloseButton
      footer={
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => onPublish?.({ from, to })}
        >
          Publish
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextField
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
    </Modal>
  );
}
