import { useMemo, useState } from "react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Alert from "../ui/Alert.jsx";
import SearchInput from "../ui/SearchInput.jsx";
import Pagination from "../ui/Pagination.jsx";
import { Select } from "../ui/TextField.jsx";
import StaffFormDialog from "../staff/StaffFormDialog.jsx";
import {
  TableCard,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../ui/Table.jsx";
import { getStaff, ROLE_OPTIONS, roleLabel, STATUS_TONES, updateStaff } from "../../lib/api/staff.js";
import { useApiData } from "../../lib/api/use-api-data.js";

const ROLE_FILTERS = ["All Roles", ...ROLE_OPTIONS.map((r) => r.label)];

/**
 * Settings > Users
 *
 * "The users listed here are staff members with a portal role" was true of
 * the mock and stays true of the real thing: this reads the same
 * `Employee` resource as StaffPage, through the same `staff/` endpoint, so
 * the two screens can never disagree about who exists. Editing here opens
 * the same `StaffFormDialog` StaffPage does.
 *
 * DEVIATION: the earlier mock's row action was "Deactivate" — there is no
 * such transition in this API (`Employee.status` is Pending / Approved /
 * Rejected, and nothing else here writes `is_active`). Dropped rather than
 * wired to nothing.
 */
export default function UsersSettings() {
  const { data: staff, loading, error, reload } = useApiData(getStaff, []);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(ROLE_FILTERS[0]);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => {
    const byRole =
      roleFilter === ROLE_FILTERS[0] ? staff : staff.filter((u) => roleLabel(u.role) === roleFilter);

    const q = query.trim().toLowerCase();
    if (!q) return byRole;
    return byRole.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [staff, query, roleFilter]);

  async function handleSaved(payload) {
    // Optional chaining: the React Compiler hoists a plain `editing.id` read
    // into a memoization check that runs on every render — including the
    // first, while `editing` is still null — which would crash the whole
    // tab before this function is ever called. Same fix as InventoryPage's
    // handleSaved.
    await updateStaff(editing?.id, payload);
    setEditing(null);
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <SearchInput
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search users"
          className="flex-1"
        />
        <Select
          aria-label="Filter by role"
          options={ROLE_FILTERS}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-48 shrink-0"
        />
      </div>

      {error && <Alert tone="error">Could not load users: {error.message}</Alert>}

      <TableCard>
        <Table density="dense" nowrap>
          <THead>
            <TR>
              <TH width={240}>Name</TH>
              <TH width={220} align="center">Email</TH>
              <TH width={160} align="center">Role</TH>
              <TH width={110} align="center">Status</TH>
              <TH width={100} align="right">Action</TH>
            </TR>
          </THead>

          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={5} align="center" className="py-6 text-tertiary">
                  Loading users...
                </TD>
              </TR>
            ) : rows.length === 0 ? (
              <TR>
                <TD colSpan={5} align="center" className="py-6 text-tertiary">
                  No users match this view.
                </TD>
              </TR>
            ) : (
              rows.map((user) => (
                <TR key={user.id}>
                  <TD className="font-medium text-primary">{user.name}</TD>
                  <TD align="center">{user.email}</TD>
                  <TD align="center">{roleLabel(user.role)}</TD>
                  <TD align="center">
                    <Badge tone={STATUS_TONES[user.status] ?? "neutral"}>{user.status}</Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end">
                      <Button variant="linkBrand" onClick={() => setEditing(user)}>
                        Edit
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </TableCard>

      <Pagination hasPrevious={false} />

      {/* Keyed so the dialog re-seeds per user rather than an effect writing
          state during render - the pattern every detail dialog here uses. */}
      <StaffFormDialog
        key={`edit-${editing?.id}`}
        mode="edit"
        staff={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
