import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { Select } from "../../components/ui/TextField.jsx";
import VendorFormDialog from "../../components/vendors/VendorFormDialog.jsx";
import VendorDetailDialog from "../../components/vendors/VendorDetailDialog.jsx";
import AssignStockDialog from "../../components/vendors/AssignStockDialog.jsx";
import VendorChatDialog from "../../components/vendors/VendorChatDialog.jsx";
import {
  TableCard,
  TableToolbar,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  CellStack,
} from "../../components/ui/Table.jsx";
import {
  VENDORS,
  VENDOR_STATUS,
  SPECIALIZATION,
  VENDOR_STATUS_OPTIONS,
} from "../../data/vendors.js";

/**
 * Vendors - Shivalik Admin
 * Figma: GOLDEN / Vendors (node 1180:48387)
 *   + Add / Edit Vendor dialog (1180:48049 / 48090)
 *   + Assign Stock dialog      (1180:48141)
 *   + Vendor detail dialog     (1180:48178 / 48212 / 48262)
 *   + Vendor chat panel        (1180:48315)
 *
 * `filter` comes from the route so the sidebar sub-items drive one page, the
 * same construction as ClientsPage and SupportTicketsPage.
 *
 * DEVIATION: Figma draws the sidebar sub-items as *checkboxes* (Printing
 * Vendors / Binding Vendors / Active / Inactive), which implies combinable
 * filters. They are routes here, matching Clients: the sidebar is generated
 * from the portal registry and is a navigation tree, not a filter surface, so
 * stateful checkboxes there would have to reach across the app shell. Each
 * item still resolves to the listing it names.
 *
 * DEVIATION: the flattened backdrop the dialogs sit over is titled "Orders"
 * while the live frame's own header reads "Vendors". Rendered as "Vendors" -
 * the backdrop is a stale screenshot.
 */
export default function VendorsPage({ filter = "all" }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Status");
  // null | { mode: "add" } | { mode: "edit", vendor }
  const [form, setForm] = useState(null);
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [chatting, setChatting] = useState(null);

  const rows = useMemo(() => {
    let list = VENDORS;

    if (filter === "printing" || filter === "binding") {
      list = list.filter((v) => v.specialization === filter);
    } else if (filter === "active" || filter === "inactive") {
      list = list.filter((v) => v.status === filter);
    }

    if (status !== "Status") {
      list = list.filter((v) => VENDOR_STATUS[v.status].label === status);
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
    );
  }, [filter, query, status]);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Vendors"
        actions={
          <Button
            variant="primary"
            iconLeading="plus"
            onClick={() => setForm({ mode: "add" })}
          >
            Add Vendors
          </Button>
        }
      />

      <TableCard>
        <TableToolbar className="flex items-center gap-4">
          <SearchInput
            placeholder="Search vendors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search vendors"
            className="flex-1"
          />
          <Select
            aria-label="Filter by status"
            options={["Status", ...VENDOR_STATUS_OPTIONS]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-32 shrink-0"
          />
        </TableToolbar>

        {/* dense + nowrap: eight columns in the width Clients gives five. */}
        <Table density="dense" nowrap>
          <THead>
            <TR>
              <TH width={140} align="center">Vendor ID</TH>
              <TH width={268}>Vendor</TH>
              <TH width={105} align="center">Specialization</TH>
              <TH width={83} align="center">Active Orders</TH>
              <TH width={130} align="center">Available Stock</TH>
              <TH width={106} align="center">Assign Stock</TH>
              <TH width={123} align="center">Status</TH>
              <TH width={120} align="right">Action</TH>
            </TR>
          </THead>

          <TBody>
            {rows.map((vendor) => {
              const spec = SPECIALIZATION[vendor.specialization];
              const state = VENDOR_STATUS[vendor.status];

              return (
                <TR
                  key={vendor.id}
                  className="cursor-pointer transition-colors hover:bg-subtle"
                  onClick={() => setSelected(vendor)}
                >
                  <TD align="center">{vendor.id}</TD>
                  <TD>
                    <CellStack primary={vendor.name} supporting={vendor.city} />
                  </TD>
                  <TD align="center">
                    <Badge tone={spec.tone}>{spec.label}</Badge>
                  </TD>
                  <TD align="center">{vendor.activeOrders}</TD>
                  <TD align="center">{vendor.availableStock}</TD>
                  <TD align="center">
                    {/* Stopped so the row click does not also open the detail
                        dialog behind the Assign Stock dialog. */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setAssigning(vendor)}
                      >
                        Assign
                      </Button>
                    </div>
                  </TD>
                  <TD align="center">
                    <Badge tone={state.tone}>{state.label}</Badge>
                  </TD>
                  <TD>
                    <div
                      className="flex items-center justify-end gap-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="link"
                        onClick={() => setForm({ mode: "edit", vendor })}
                      >
                        Edit
                      </Button>
                      <Button variant="link" onClick={() => setSelected(vendor)}>
                        View
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

      {/* Each dialog is keyed so its fields re-seed from the row it was opened
          for, without an effect writing state during render. */}
      <VendorFormDialog
        key={`${form?.mode}-${form?.vendor?.id ?? "new"}`}
        mode={form?.mode ?? "add"}
        vendor={form?.vendor}
        open={form !== null}
        onClose={() => setForm(null)}
      />

      <VendorDetailDialog
        key={`detail-${selected?.id}`}
        vendor={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onChat={(vendor) => {
          setSelected(null);
          setChatting(vendor);
        }}
      />

      <AssignStockDialog
        key={`stock-${assigning?.id}`}
        vendor={assigning}
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
      />

      <VendorChatDialog
        key={`chat-${chatting?.id}`}
        vendor={chatting}
        open={Boolean(chatting)}
        onClose={() => setChatting(null)}
      />
    </div>
  );
}
