import Button from "./Button.jsx";
import Badge from "./Badge.jsx";
import { Select } from "./TextField.jsx";
import { ATTENDANCE_STATES } from "../../data/dashboard.js";

/**
 * AttendanceDecision
 * -----------------------------------------------------------------------------
 * The state-dependent pair every attendance row shows: a status dropdown plus
 * either Reject/Approve actions (pending) or a locked, greyed dropdown with an
 * outcome badge (decided). Shared by the Dashboard's attendance list
 * (`AttendanceRequests`, node 790:22407) and the Staff Attendance table's
 * "Today" column (node 1181:84722) - same decision, two different row shells
 * around it (a card list vs. a full table), so the shell stays separate and
 * this piece stays one component rather than living twice.
 *
 * Figma shows one row (Late) with an outcome badge but a still-enabled-looking
 * dropdown - inconsistent with the other decided row (Present, dropdown
 * visibly locked). This always locks the dropdown once `outcome` is set,
 * which is the state the "locked" row demonstrates and the only reading that
 * makes sense once a decision exists.
 */
export default function AttendanceDecision({
  name,
  state,
  outcome,
  onStateChange,
  onDecide,
}) {
  const decided = Boolean(outcome);

  return (
    <div className="flex items-center gap-3">
      <Select
        className="w-36"
        aria-label={`Attendance state for ${name}`}
        options={ATTENDANCE_STATES}
        value={state}
        disabled={decided}
        onChange={(e) => onStateChange?.(e.target.value)}
      />

      {decided ? (
        <Badge tone={outcome === "approved" ? "success" : "error"}>
          {outcome === "approved" ? "Present" : "Absent"}
        </Badge>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="brandSubtle" onClick={() => onDecide?.("rejected")}>
            Reject
          </Button>
          <Button variant="primary" onClick={() => onDecide?.("approved")}>
            Approve
          </Button>
        </div>
      )}
    </div>
  );
}
