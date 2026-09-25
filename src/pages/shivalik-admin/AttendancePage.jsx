import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import { StatGrid } from "../../components/ui/StatCard.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import StaffAttendanceTable from "../../components/staff/StaffAttendanceTable.jsx";
import StaffDetailDialog from "../../components/staff/StaffDetailDialog.jsx";
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
 * "View" opens the same StaffDetailDialog as the All Staff page, read-only.
 * The dialog's Attendance tab was removed when Staff was connected to the API
 * (nothing backs it — attendance scope is an open question), and this page's
 * records are mock data, so it offers no Edit either.
 */
export default function AttendancePage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(ATTENDANCE_ROWS);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

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

      {/* View only. This page and its staff records are mock data (whether
          attendance is in scope is still undecided), so there is nothing an
          Edit here could save to — real staff are edited on the Staff screen.
          Without `onEdit` the dialog shows no Edit button. */}
      <StaffDetailDialog
        key={selected?.id}
        staff={selected}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />
    </div>
  );
}
