import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import {
  TableCard,
  TableToolbar,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/ui/Table.jsx";
import StaffDetailDialog from "../../components/staff/StaffDetailDialog.jsx";
import StaffFormDialog from "../../components/staff/StaffFormDialog.jsx";
import { STAFF } from "../../data/staff.js";

/**
 * All Staff - Shivalik Admin
 * Figma: FINAL SCREENS / Shivalik Final / Staff (node 1181:84436)
 *   + Add Staff Member dialog  (1181:84993)
 *   + Edit Staff Member dialog (1181:85085) - opened from the detail
 *     dialog's own Edit button, not from this page directly
 *   + Staff detail dialog      (1181:84909 / 36 / 72, three tabs)
 *
 * Same construction as ClientsPage: a filterable table opening one detail
 * dialog and one add/edit form dialog, both reused across this page and
 * AttendancePage's own "View".
 */
export default function StaffPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // staff being viewed/edited
  const [viewOpen, setViewOpen] = useState(false);
  const [formMode, setFormMode] = useState(null); // null | "add" | "edit"

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STAFF;
    return STAFF.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  function view(staff) {
    setSelected(staff);
    setViewOpen(true);
  }

  function editFromDetail(staff) {
    setSelected(staff);
    setViewOpen(false);
    setFormMode("edit");
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Staff"
        actions={
          <Button variant="primary" iconLeading="plus" onClick={() => setFormMode("add")}>
            Add Staff Member
          </Button>
        }
      />

      <TableCard>
        <TableToolbar>
          <SearchInput
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search staff by name"
          />
        </TableToolbar>

        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Phone</TH>
              <TH>Role</TH>
              <TH align="right">Salary</TH>
              <TH align="right">
                <span className="sr-only">Action</span>
              </TH>
            </TR>
          </THead>

          <TBody>
            {rows.map((staff) => (
              <TR
                key={staff.id}
                className="cursor-pointer transition-colors hover:bg-subtle"
                onClick={() => view(staff)}
              >
                <TD className="font-medium text-primary">{staff.name}</TD>
                <TD>{staff.phoneMasked}</TD>
                <TD>{staff.role}</TD>
                <TD align="right" className="tabular font-medium text-primary">
                  {staff.salaryListed}
                </TD>
                <TD align="right">
                  <Button
                    variant="linkBrand"
                    onClick={(e) => {
                      e.stopPropagation();
                      view(staff);
                    }}
                  >
                    View
                  </Button>
                </TD>
              </TR>
            ))}

            {rows.length === 0 && (
              <TR>
                <TD colSpan={5} align="center" className="text-tertiary">
                  No staff match this search.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </TableCard>

      <Pagination hasPrevious={false} />

      {/* key remounts per staff member, resetting the tab to Overview without
          an effect writing state during render - same fix as
          ClientDetailDialog / PaymentDialog. */}
      <StaffDetailDialog
        key={selected?.id}
        staff={selected}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        onEdit={editFromDetail}
      />

      <StaffFormDialog
        key={`${formMode}-${formMode === "edit" ? selected?.id : "new"}`}
        mode={formMode ?? "add"}
        staff={formMode === "edit" ? selected : null}
        open={formMode !== null}
        onClose={() => setFormMode(null)}
      />
    </div>
  );
}
