import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import Alert from "../../components/ui/Alert.jsx";
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
import {
  approveStaff,
  createStaff,
  getStaff,
  rejectStaff,
  roleLabel,
  STATUS_TONES,
  updateStaff,
} from "../../lib/api/staff.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { formatINR } from "../../lib/format.js";

/**
 * All Staff — Shivalik Admin
 *
 * `Employee` is the one resource behind both this screen and Settings →
 * Users (`UsersSettings`) — see that component's own note.
 */
export default function StaffPage() {
  const { data: staff, loading, error, reload } = useApiData(getStaff, []);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formMode, setFormMode] = useState(null); // null | "add" | "edit"
  const [rowError, setRowError] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [staff, query]);

  function view(person) {
    setSelected(person);
    setViewOpen(true);
  }

  function editFromDetail(person) {
    setSelected(person);
    setViewOpen(false);
    setFormMode("edit");
  }

  async function handleSaved(payload) {
    // Optional chaining even though this branch only runs once `selected` is
    // already set: the React Compiler can hoist a member-expression read
    // like `selected.id` into a memoization check evaluated on every render,
    // including the first with `selected` still null. See InventoryPage's
    // handleSaved for the full explanation.
    if (formMode === "add") {
      await createStaff(payload);
    } else {
      await updateStaff(selected?.id, payload);
    }
    setFormMode(null);
    reload();
  }

  async function quickApprove(person) {
    setRowError("");
    try {
      await approveStaff(person.id);
      reload();
    } catch (err) {
      setRowError(err.message);
    }
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

      {error && <Alert tone="error">Could not load staff: {error.message}</Alert>}
      {rowError && <Alert tone="error">{rowError}</Alert>}

      <TableCard>
        <TableToolbar>
          <SearchInput
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search staff by name or email"
          />
        </TableToolbar>

        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH align="right">Salary</TH>
              <TH align="right">
                <span className="sr-only">Action</span>
              </TH>
            </TR>
          </THead>

          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={5} align="center" className="text-tertiary">
                  Loading staff...
                </TD>
              </TR>
            ) : (
              rows.map((person) => (
                <TR
                  key={person.id}
                  className="cursor-pointer transition-colors hover:bg-subtle"
                  onClick={() => view(person)}
                >
                  <TD className="font-medium text-primary">
                    <div className="flex flex-col">
                      <span>{person.name}</span>
                      <span className="text-xs text-tertiary">{person.email}</span>
                    </div>
                  </TD>
                  <TD>{roleLabel(person.role)}</TD>
                  <TD>
                    <Badge tone={STATUS_TONES[person.status] ?? "neutral"}>{person.status}</Badge>
                  </TD>
                  <TD align="right" className="tabular font-medium text-primary">
                    {person.salary ? formatINR(person.salary) : "—"}
                  </TD>
                  <TD align="right">
                    <div className="flex items-center justify-end gap-4" onClick={(e) => e.stopPropagation()}>
                      {person.status === "Pending" && (
                        <Button variant="linkBrand" onClick={() => quickApprove(person)}>
                          Approve
                        </Button>
                      )}
                      <Button variant="linkBrand" onClick={() => view(person)}>
                        View
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}

            {!loading && rows.length === 0 && (
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
        approverName={staff.find((s) => s.id === selected?.approved_by)?.name}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        onEdit={editFromDetail}
        onApprove={async (person) => {
          await approveStaff(person.id);
          setViewOpen(false);
          reload();
        }}
        onReject={async (person, reason) => {
          await rejectStaff(person.id, reason);
          setViewOpen(false);
          reload();
        }}
      />

      <StaffFormDialog
        key={`${formMode}-${formMode === "edit" ? selected?.id : "new"}`}
        mode={formMode ?? "add"}
        staff={formMode === "edit" ? selected : null}
        open={formMode !== null}
        onClose={() => setFormMode(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
