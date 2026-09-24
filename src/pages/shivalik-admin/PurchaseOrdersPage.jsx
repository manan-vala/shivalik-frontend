import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { Select } from "../../components/ui/TextField.jsx";
import PurchaseOrderFormDialog from "../../components/vendors/PurchaseOrderFormDialog.jsx";
import PurchaseOrderDetailDialog from "../../components/vendors/PurchaseOrderDetailDialog.jsx";
import PurchaseOrderReceiveDialog from "../../components/vendors/PurchaseOrderReceiveDialog.jsx";
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
import {
  cancelPurchaseOrder,
  createPurchaseOrder,
  dispatchPurchaseOrder,
  getBooks,
  getPurchaseOrder,
  getPurchaseOrders,
  getRacks,
  getVendors,
  receivePurchaseOrder,
  updatePurchaseOrder,
} from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { PO_STATUS, poTotal } from "../../data/purchaseOrders.js";
import { formatINR } from "../../lib/format.js";

const STATUS_FILTERS = ["All Statuses", ...Object.values(PO_STATUS).map((s) => s.label)];

async function loadAll() {
  const [orders, vendors, books, racks] = await Promise.all([
    getPurchaseOrders(),
    getVendors(),
    getBooks(),
    getRacks(),
  ]);
  return { orders, vendors, books, racks };
}

const EMPTY = { orders: [], vendors: [], books: [], racks: [] };

/**
 * Purchase Orders — Shivalik Admin
 *
 * The screen the backend's create/dispatch/receive endpoints never had a
 * frontend for. Lives under Vendors (same owning team, same backend file:
 * `inventory/views/vendor.py`) rather than under Inventory Overview, which
 * is stock levels, not the documents that replenish them.
 */
export default function PurchaseOrdersPage() {
  const { data, loading, error, reload } = useApiData(loadAll, EMPTY);
  const { orders, vendors, books, racks } = data;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0]);
  const [form, setForm] = useState(null); // null | { mode: "add" } | { mode: "edit", order }
  const [selected, setSelected] = useState(null);
  const [receiving, setReceiving] = useState(null);

  const rows = useMemo(() => {
    let list = orders;
    if (statusFilter !== STATUS_FILTERS[0]) {
      list = list.filter((o) => PO_STATUS[o.status]?.label === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) => o.vendor_name.toLowerCase().includes(q) || String(o.id).includes(q)
    );
  }, [orders, statusFilter, query]);

  async function refreshSelected(id) {
    const fresh = await getPurchaseOrder(id);
    setSelected(fresh);
    reload();
    return fresh;
  }

  async function handleFormSaved(payload) {
    // Optional chaining, not just a null check up front — see InventoryPage's
    // handleSaved for why an unguarded `form.mode` crashes on mount.
    if (form?.mode === "add") {
      await createPurchaseOrder(payload);
    } else {
      await updatePurchaseOrder(form?.order?.id, payload);
    }
    setForm(null);
    reload();
  }

  async function handleReceived(lines) {
    // Optional chaining — see handleFormSaved above for why an unguarded
    // `receiving.id` crashes the page on mount, not just when this runs.
    const id = receiving?.id;
    await receivePurchaseOrder(id, lines);
    setReceiving(null);
    await refreshSelected(id);
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Purchase Orders"
        actions={
          <Button
            variant="primary"
            iconLeading="plus"
            onClick={() => setForm({ mode: "add" })}
            disabled={loading}
          >
            New Purchase Order
          </Button>
        }
      />

      {error && <Alert tone="error">Could not load purchase orders: {error.message}</Alert>}

      <TableCard>
        <TableToolbar className="flex items-center gap-4">
          <SearchInput
            placeholder="Search by vendor or PO #..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search purchase orders"
            className="flex-1"
          />
          <Select
            aria-label="Filter by status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44 shrink-0"
          />
        </TableToolbar>

        <Table density="dense" nowrap>
          <THead>
            <TR>
              <TH width={90}>PO #</TH>
              <TH width={220}>Vendor</TH>
              <TH width={130}>Order Date</TH>
              <TH width={80} align="center">Lines</TH>
              <TH width={130} align="right">Total</TH>
              <TH width={120} align="center">Status</TH>
              <TH width={100} align="right">Action</TH>
            </TR>
          </THead>

          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={7} align="center" className="py-8 text-tertiary">
                  Loading purchase orders...
                </TD>
              </TR>
            ) : rows.length === 0 ? (
              <TR>
                <TD colSpan={7} align="center" className="py-8 text-tertiary">
                  No purchase orders match this view.
                </TD>
              </TR>
            ) : (
              rows.map((order) => {
                const status = PO_STATUS[order.status] ?? PO_STATUS.DRAFT;
                return (
                  <TR
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-subtle"
                    onClick={() => setSelected(order)}
                  >
                    <TD className="font-medium text-primary">PO-{order.id}</TD>
                    <TD>{order.vendor_name}</TD>
                    <TD>{order.order_date || "—"}</TD>
                    <TD align="center">{order.lines?.length ?? 0}</TD>
                    <TD align="right" className="tabular font-medium text-primary">
                      {formatINR(poTotal(order))}
                    </TD>
                    <TD align="center">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button variant="linkBrand" onClick={() => setSelected(order)}>
                          View
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>

      <Pagination hasPrevious={false} />

      <PurchaseOrderFormDialog
        key={`${form?.mode}-${form?.order?.id ?? "new"}`}
        mode={form?.mode ?? "add"}
        order={form?.order}
        vendors={vendors}
        books={books}
        open={form !== null}
        onClose={() => setForm(null)}
        onSaved={handleFormSaved}
      />

      <PurchaseOrderDetailDialog
        key={`detail-${selected?.id}`}
        order={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onEdit={(order) => {
          setSelected(null);
          setForm({ mode: "edit", order });
        }}
        onPlace={async (order) => {
          await updatePurchaseOrder(order.id, { status: "PLACED" });
          await refreshSelected(order.id);
        }}
        onDispatch={async (order) => {
          await dispatchPurchaseOrder(order.id);
          await refreshSelected(order.id);
        }}
        onCancel={async (order) => {
          await cancelPurchaseOrder(order.id);
          await refreshSelected(order.id);
        }}
        onReceive={(order) => {
          setSelected(null);
          setReceiving(order);
        }}
      />

      <PurchaseOrderReceiveDialog
        key={`receive-${receiving?.id}`}
        order={receiving}
        racks={racks}
        open={Boolean(receiving)}
        onClose={() => setReceiving(null)}
        onReceived={handleReceived}
      />
    </div>
  );
}
