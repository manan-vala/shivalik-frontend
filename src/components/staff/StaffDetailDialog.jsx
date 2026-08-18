import { useId, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Tabs, { TabPanel } from "../ui/Tabs.jsx";
import { DetailList } from "../ui/PlainTable.jsx";
import StatCard from "../ui/StatCard.jsx";
import AttendanceCalendar from "./AttendanceCalendar.jsx";
import {
  STAFF_ATTENDANCE_STATS,
  ATTENDANCE_MONTHS,
  ATTENDANCE_TODAY,
  buildPresentDates,
} from "../../data/staff.js";

/**
 * Staff detail dialog
 * Figma: FINAL SCREENS / Shivalik Final
 *   Overview    Group 75 (1181:84909)
 *   Attendance  Group 76 (1181:84936) - Group 77 (1181:84954) is an exact
 *               duplicate frame, not a fourth state; not modelled separately
 *   Salary      Group 78 (1181:84972)
 *
 * One dialog, three tabs - same construction as ClientDetailDialog, for the
 * same reason: three Figma frames because a static file can't show tab
 * state, not three dialogs.
 *
 * `defaultTab` lets the two screens that open this land on the tab their own
 * context is about: All Staff opens on Overview, the Attendance page's own
 * "View" opens straight on Attendance.
 *
 * NOTE: the badge beside the name uses primary-700 at 20% opacity in Figma -
 * the same one-off treatment already reconciled to the `brand` badge tone in
 * ClientDetailDialog. Same fix, same reasoning, here.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "attendance", label: "Attendance" },
  { id: "salary", label: "Salary" },
];

export default function StaffDetailDialog({
  staff,
  open,
  onClose,
  onEdit,
  defaultTab = "overview",
}) {
  const [tab, setTab] = useState(defaultTab);
  const titleId = useId();
  // Present/weekend/today are the same illustrative calendar for every
  // record - see data/staff.js. Computed once per mount, not per render.
  const [presentOn] = useState(buildPresentDates);

  if (!staff) return null;

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
                <Badge tone="brand">{staff.currentTask}</Badge>
                <span className="text-xs font-medium text-tertiary">
                  {staff.department}
                </span>
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
          <DetailList
            items={[
              { label: "Phone", value: staff.phone },
              { label: "Email", value: staff.email },
              { label: "Joined", value: staff.joined },
              { label: "Department", value: staff.department },
            ]}
          />
        </TabPanel>

        <TabPanel id="attendance" active={tab === "attendance"}>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STAFF_ATTENDANCE_STATS.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
            <AttendanceCalendar
              months={ATTENDANCE_MONTHS}
              presentOn={presentOn}
              today={ATTENDANCE_TODAY}
            />
          </div>
        </TabPanel>

        <TabPanel id="salary" active={tab === "salary"}>
          <DetailList
            items={[
              { label: "Monthly", value: staff.salaryMonthly },
              { label: "Contract", value: staff.contractType },
              { label: "Last payout", value: staff.lastPayout },
            ]}
          />
        </TabPanel>
      </div>
    </Modal>
  );
}
