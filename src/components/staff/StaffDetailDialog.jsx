import { useId, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import Tabs, { TabPanel } from "../ui/Tabs.jsx";
import { DetailList } from "../ui/PlainTable.jsx";
import { Textarea } from "../ui/TextField.jsx";
import { roleLabel, STATUS_TONES } from "../../lib/api/staff.js";
import { formatINR } from "../../lib/format.js";

/**
 * Staff detail dialog
 *
 * Overview and Salary, both real `Employee` fields. The earlier mock's
 * Attendance tab is gone — there is no attendance endpoint or model behind
 * it (the domain docs list attendance as an open question, not something
 * built), so the tab had nowhere real to point.
 *
 * A Pending record gets Approve / Reject here instead of a third tab:
 * that's the one thing about this employee that still needs a decision,
 * so it sits with the name rather than behind a click.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "salary", label: "Salary" },
];

/**
 * `approverName` is resolved by the parent from its own staff list:
 * `approved_by` on the wire is a bare employee id.
 */
export default function StaffDetailDialog({
  staff,
  approverName,
  open,
  onClose,
  onEdit,
  onApprove,
  onReject,
}) {
  const [tab, setTab] = useState("overview");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const titleId = useId();

  if (!staff) return null;

  async function handleApprove() {
    setBusy(true);
    setError("");
    try {
      await onApprove(staff);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError("A reason is required to reject an application.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onReject(staff, reason.trim());
      setRejecting(false);
      setReason("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={1096}
      titleId={titleId}
      header={
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <div className="flex flex-1 flex-col gap-2">
              <h2 id={titleId} className="text-display-xs font-medium text-primary">
                {staff.name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONES[staff.status] ?? "neutral"}>{staff.status}</Badge>
                <span className="text-xs font-medium text-tertiary">{roleLabel(staff.role)}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onEdit?.(staff)}>
              Edit
            </Button>
          </div>
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="Staff details" />
        </div>
      }
    >
      <div className="min-h-70 pt-5">
        <TabPanel id="overview" active={tab === "overview"}>
          <div className="flex flex-col gap-5">
            <DetailList
              items={[
                { label: "Email", value: staff.email },
                { label: "Phone", value: staff.phone || "—" },
                { label: "Department", value: staff.department || "—" },
                { label: "Address", value: staff.address || "—" },
                { label: "Requested Role", value: staff.requested_role ? roleLabel(staff.requested_role) : "—" },
                ...(staff.status === "Approved"
                  ? [
                      { label: "Approved By", value: approverName || "—" },
                      {
                        label: "Approved At",
                        value: staff.approved_at ? new Date(staff.approved_at).toLocaleString() : "—",
                      },
                    ]
                  : []),
                ...(staff.status === "Rejected"
                  ? [{ label: "Rejection Reason", value: staff.rejection_reason || "—" }]
                  : []),
              ]}
            />

            {staff.status === "Pending" && (
              <div className="flex flex-col gap-3 rounded-md border border-border-default bg-subtle p-4">
                <p className="text-sm font-medium text-primary">This application is awaiting a decision.</p>
                {error && <Alert tone="error">{error}</Alert>}
                {rejecting ? (
                  <div className="flex flex-col gap-3">
                    <Textarea
                      label="Rejection Reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <Button variant="dangerOutline" onClick={handleReject} disabled={busy}>
                        Confirm Rejection
                      </Button>
                      <Button variant="secondary" onClick={() => setRejecting(false)} disabled={busy}>
                        Back
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="success" onClick={handleApprove} disabled={busy}>
                      Approve
                    </Button>
                    <Button variant="dangerOutline" onClick={() => setRejecting(true)} disabled={busy}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel id="salary" active={tab === "salary"}>
          <DetailList
            items={[
              { label: "Monthly Salary", value: staff.salary ? formatINR(staff.salary) : "Not set" },
            ]}
          />
        </TabPanel>
      </div>
    </Modal>
  );
}
