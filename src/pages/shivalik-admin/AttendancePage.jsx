import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import { StatGrid } from "../../components/ui/StatCard.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import StaffAttendanceTable from "../../components/staff/StaffAttendanceTable.jsx";
import StaffDetailDialog from "../../components/staff/StaffDetailDialog.jsx";
import StaffFormDialog from "../../components/staff/StaffFormDialog.jsx";
import { STAFF, ATTENDANCE_OVERVIEW, MONTHLY_ATTENDANCE, ATTENDANCE_ROWS } from "../../data/staff.js";

/**
 * Attendance - Shivalik Admin
 * Figma: FINAL SCREENS / Shivalik Final / Staff > Attendance (node 1181:84672)
 *
 * Stat row + Monthly Attendance card reuse the exact StatCard/Card/StatGrid
 * pieces the Dashboard already built for the same two blocks (nodes
 * 1181:84698/84703, matching 790:22391/790:22374 on the Dashboard) - not
 * rebuilt here.
 *
 * "View" opens the same StaffDetailDialog as the All Staff page, defaulting
 * to its Attendance tab rather than Overview, since that is what this page's
 * own context is about.
 */
export default function AttendancePage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(ATTENDANCE_ROWS);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formMode, setFormMode] = useState(null); // null | "edit"

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, query]);

  function changeState(id, state) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, state } : r)));
  }

  function decide(id, outcome) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, outcome } : r)));
  }

  function view(row) {
    setSelected(STAFF.find((s) => s.id === row.staffId) ?? null);
    setViewOpen(true);
  }

  function editFromDetail(staff) {
    setSelected(staff);
    setViewOpen(false);
    setFormMode("edit");
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader title="Staff" />

      <StatGrid items={ATTENDANCE_OVERVIEW} />

      <Card title={MONTHLY_ATTENDANCE.title}>
        <StatGrid items={MONTHLY_ATTENDANCE.stats} />
      </Card>

      <SearchInput
        placeholder="Search by name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search staff by name"
      />

      <StaffAttendanceTable
        rows={visibleRows}
        onStateChange={changeState}
        onDecide={decide}
        onView={view}
      />

      <Pagination hasPrevious={false} />

      <StaffDetailDialog
        key={selected?.id}
        staff={selected}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        onEdit={editFromDetail}
        defaultTab="attendance"
      />

      <StaffFormDialog
        key={selected?.id}
        mode="edit"
        staff={selected}
        open={formMode === "edit"}
        onClose={() => setFormMode(null)}
      />
    </div>
  );
}
