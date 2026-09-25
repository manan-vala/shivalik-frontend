import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import Alert from "../../components/ui/Alert.jsx";
import VendorFormDialog from "../../components/vendors/VendorFormDialog.jsx";
import VendorDetailDialog from "../../components/vendors/VendorDetailDialog.jsx";
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
  blockVendor,
  createVendor,
  getVendors,
  unblockVendor,
  updateVendor,
} from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";

/**
 * Vendors — Shivalik Admin
 *
 * `filter` comes from the route, the same construction as ClientsPage and
 * the sidebar's Vendors sub-items ("All", "Printing Vendors", "Binding
 * Vendors", "Active", "Inactive").
 *
 * DEVIATION: "printing"/"binding" were a vendor *specialization* in the
 * earlier mock; the backend has no such field. `Vendor.categories_supplied`
 * is the closest real thing — a free-text list ("Fiction", "Engineering",
 * …) — so those two sidebar items filter on a category matching the word,
 * case-insensitively, rather than a dedicated enum. A vendor only shows up
 * there once someone has actually recorded "Printing" or "Binding" as one
 * of its categories.
 */
export default function VendorsPage({ filter = "all" }) {
  const { data: vendors, loading, error, reload } = useApiData(getVendors, []);
  const [query, setQuery] = useState("");
  // null | { mode: "add" } | { mode: "edit", vendor }
  const [form, setForm] = useState(null);
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    let list = vendors;

    if (filter === "printing" || filter === "binding") {
      list = list.filter((v) =>
        (v.categories_supplied ?? []).some((c) => c.toLowerCase() === filter)
      );
    } else if (filter === "active") {
      list = list.filter((v) => !v.is_blocked);
    } else if (filter === "inactive") {
      list = list.filter((v) => v.is_blocked);
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (v) =>
        v.company_name.toLowerCase().includes(q) ||
        v.vendor_name.toLowerCase().includes(q) ||
        v.gst_number.toLowerCase().includes(q)
    );
  }, [vendors, filter, query]);

  async function handleSaved(payload) {
    // Optional chaining throughout — an unguarded `form.mode` read gets
    // hoisted by the React Compiler into a memoization check that runs on
    // every render, including the first with `form` still null, and crashes
    // the whole page before the dialog that would ever call this exists.
    if (form?.mode === "add") {
      await createVendor(payload);
    } else {
      await updateVendor(form?.vendor?.id, payload);
    }
    setForm(null);
    reload();
  }

  // Throws on failure: the detail dialog shows the error itself. A page-level
  // alert would sit behind the modal's backdrop, and the click would appear
  // to do nothing.
  async function handleBlockToggle(vendor) {
    if (vendor.is_blocked) await unblockVendor(vendor.id);
    else await blockVendor(vendor.id);
    setSelected(null);
    reload();
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Vendors"
        actions={
          <Button variant="primary" iconLeading="plus" onClick={() => setForm({ mode: "add" })}>
            Add Vendor
          </Button>
        }
      />

      {error && <Alert tone="error">Could not load vendors: {error.message}</Alert>}

      <TableCard>
        <TableToolbar className="flex items-center gap-4">
          <SearchInput
            placeholder="Search vendors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search vendors"
            className="flex-1"
          />
        </TableToolbar>

        <Table density="dense" nowrap>
          <THead>
            <TR>
              <TH width={120} align="center">ID</TH>
              <TH width={260}>Vendor</TH>
              <TH width={160}>GSTIN</TH>
              <TH width={180}>Categories</TH>
              <TH width={110} align="center">Purchase Orders</TH>
              <TH width={110} align="center">Status</TH>
              <TH width={140} align="right">Action</TH>
            </TR>
          </THead>

          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={7} align="center" className="py-8 text-tertiary">
                  Loading vendors...
                </TD>
              </TR>
            ) : rows.length === 0 ? (
              <TR>
                <TD colSpan={7} align="center" className="py-8 text-tertiary">
                  No vendors match this view.
                </TD>
              </TR>
            ) : (
              rows.map((vendor) => (
                <TR
                  key={vendor.id}
                  className="cursor-pointer transition-colors hover:bg-subtle"
                  onClick={() => setSelected(vendor)}
                >
                  <TD align="center">VN-{vendor.id}</TD>
                  <TD>
                    <CellStack primary={vendor.company_name} supporting={vendor.vendor_name} />
                  </TD>
                  <TD>{vendor.gst_number}</TD>
                  <TD className="truncate max-w-[180px]">
                    {(vendor.categories_supplied ?? []).join(", ") || "—"}
                  </TD>
                  <TD align="center">{vendor.purchase_orders_count ?? 0}</TD>
                  <TD align="center">
                    <Badge tone={vendor.is_blocked ? "alert" : "success"}>
                      {vendor.is_blocked ? "Blocked" : "Active"}
                    </Badge>
                  </TD>
                  <TD>
                    <div
                      className="flex items-center justify-end gap-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="link" onClick={() => setForm({ mode: "edit", vendor })}>
                        Edit
                      </Button>
                      <Button variant="linkBrand" onClick={() => setSelected(vendor)}>
                        View
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

      <VendorFormDialog
        key={`${form?.mode}-${form?.vendor?.id ?? "new"}`}
        mode={form?.mode ?? "add"}
        vendor={form?.vendor}
        open={form !== null}
        onClose={() => setForm(null)}
        onSaved={handleSaved}
      />

      <VendorDetailDialog
        key={`detail-${selected?.id}`}
        vendor={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onEdit={(vendor) => {
          setSelected(null);
          setForm({ mode: "edit", vendor });
        }}
        onBlockToggle={handleBlockToggle}
      />
    </div>
  );
}
