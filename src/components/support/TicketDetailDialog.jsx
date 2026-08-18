import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { SelectField, Textarea } from "../ui/TextField.jsx";
import { ASSIGNEES, TICKET_STATUS } from "../../data/support.js";

const STATUS_OPTIONS = Object.values(TICKET_STATUS).map((s) => s.label);

/**
 * View Ticket dialog
 * Figma: FINAL SCREENS / Shivalik Final / Group 53/55 (nodes 1180:37631/55)
 *
 * Title is the ticket's own subject + order id, not a fixed "View Ticket" -
 * read directly off the row rather than hardcoded.
 */
export default function TicketDetailDialog({ ticket, open, onClose, onResolve }) {
  const [note, setNote] = useState("");
  // Seeded from the status's *label* ("Open"), not its internal key ("open") -
  // the <option> values below are the labels, so the raw key would never
  // match any of them and the select would render blank.
  const [status, setStatus] = useState(
    () => TICKET_STATUS[ticket?.status]?.label ?? STATUS_OPTIONS[0]
  );
  const [assignee, setAssignee] = useState(ticket?.assigned ?? "");

  if (!ticket) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${ticket.subject} on ${ticket.orderId}`}
      width={846}
      showCloseButton
      footer={
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => onResolve?.(ticket.id, { note, status, assignee })}
        >
          Resolve Ticket
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-md font-semibold text-tertiary">Subject</p>
          <p className="text-md text-primary">{ticket.body}</p>
        </div>

        <Textarea
          label="Add note"
          rows={3}
          placeholder="Add internal note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-6">
          <SelectField
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <SelectField
            label="Assign to"
            options={ASSIGNEES}
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
