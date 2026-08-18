import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { SelectField, Textarea } from "../ui/TextField.jsx";
import { ASSIGNEES } from "../../data/support.js";

/**
 * Escalate dialog
 * Figma: FINAL SCREENS / Shivalik Final / Group 54/56 (nodes 1180:37643/37667)
 *
 * Title reads the ticket's own id ("Escalate TKT-10001"), same construction
 * as TicketDetailDialog's title - not a fixed string.
 */
export default function EscalateDialog({ ticket, open, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState("");

  if (!ticket) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Escalate ${ticket.id}`}
      width={779}
      showCloseButton
      footer={
        <>
          <Button variant="brandSubtle" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => onConfirm?.(ticket.id, { reason, assignee })}
          >
            Confirm Escalation
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Textarea
          label="Reason"
          rows={3}
          placeholder="Why is this escalated?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <SelectField
          label="Assign to"
          options={ASSIGNEES}
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
      </div>
    </Modal>
  );
}
