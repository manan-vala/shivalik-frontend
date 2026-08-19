import { useMemo, useState } from "react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
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
import { USERS, USER_ROLE, USER_ROLE_FILTERS } from "../../data/settings.js";
import { STAFF } from "../../data/staff.js";

/**
 * Settings > Users
 * Figma: GOLDEN / Settings (node 1181:88147)
 *
 * The row "Edit" opens `StaffFormDialog` in edit mode - node 1181:88057 is
 * that dialog exactly (same six fields, same 1052px box, same "file123456"
 * contract), so this screen needed no new dialog at all.
 *
 * The users listed here are staff members with a portal role, so the dialog is
 * handed the matching `STAFF` record; when the API exists these become one
 * resource rather than two lists that have to agree.
 */
export default function UsersSettings() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(USER_ROLE_FILTERS[0]);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => {
    const byRole =
      roleFilter === USER_ROLE_FILTERS[0]
        ? USERS
        : USERS.filter((u) => USER_ROLE[u.role].label === roleFilter);

    const q = query.trim().toLowerCase();
    if (!q) return byRole;
    return byRole.filter((u) => u.name.toLowerCase().includes(q));
  }, [query, roleFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <SearchInput
          placeholder="Search by email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search users by email"
          className="flex-1"
        />
        <Select
          aria-label="Filter by role"
          options={USER_ROLE_FILTERS}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-40 shrink-0"
        />
      </div>

      <TableCard>
        <Table density="dense" nowrap>
          <THead>
            <TR>
              <TH width={240}>Name</TH>
              <TH width={220} align="center">Phone</TH>
              <TH width={140} align="center">Role</TH>
              <TH width={180} align="right">Action</TH>
            </TR>
          </THead>

          <TBody>
            {rows.map((user) => {
              const role = USER_ROLE[user.role];
              return (
                <TR key={user.id}>
                  <TD className="font-medium text-primary">{user.name}</TD>
                  <TD align="center">{user.phone}</TD>
                  <TD align="center">
                    <Badge tone={role.tone}>{role.label}</Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-6">
                      <Button variant="link">Deactivate</Button>
                      <Button
                        variant="linkBrand"
                        onClick={() => setEditing(user)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </TableCard>

      <Pagination hasPrevious={false} />

      {/* Keyed so the dialog re-seeds per user rather than an effect writing
          state during render - the pattern every detail dialog here uses. */}
      <StaffFormDialog
        key={`edit-${editing?.id}`}
        mode="edit"
        staff={editing ? staffFor(editing) : null}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

/**
 * The staff record behind a portal user. Falls back to a record built from the
 * user row so the dialog is never handed a half-empty object if the two lists
 * drift before the API joins them.
 */
function staffFor(user) {
  return (
    STAFF.find((s) => s.name === user.name) ?? {
      id: user.id,
      name: user.name,
      role: USER_ROLE[user.role].label,
      phone: user.phone,
      email: "",
      address: "",
      contractFile: "",
    }
  );
}
