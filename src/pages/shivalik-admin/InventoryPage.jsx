import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import {
  TableCard,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/ui/Table.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import WarehouseFormDialog from "../../components/inventory/WarehouseFormDialog.jsx";
import { createWarehouse, getWarehouses, updateWarehouse } from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";

/**
 * Warehouses — create, list and edit, plus activate/deactivate.
 *
 * No hard delete: the model's own docstring says to deactivate rather than
 * delete ("racks and ledger rows hang off this row and must not be
 * orphaned"), so that's the only retirement path offered here.
 */
export default function InventoryPage() {
  const { data: warehouses, loading, error, reload } = useApiData(getWarehouses, []);
  // null | { mode: "add" } | { mode: "edit", warehouse }
  const [form, setForm] = useState(null);
  const [rowError, setRowError] = useState("");

  async function handleSaved(payload) {
    // Optional chaining throughout, not just `form &&` up front: the React
    // Compiler hoists a plain `form.mode` read out as a memoization
    // dependency evaluated on *every* render — including the first, before
    // this function is ever called — so an unguarded read here crashes the
    // whole page on mount even though `form` is only null while the dialog
    // that would call this is closed.
    if (form?.mode === "add") {
      await createWarehouse(payload);
    } else {
      await updateWarehouse(form?.warehouse?.id, payload);
    }
    setForm(null);
    reload();
  }

  async function toggleActive(warehouse) {
    setRowError("");
    try {
      await updateWarehouse(warehouse.id, { is_active: !warehouse.is_active });
      reload();
    } catch (err) {
      setRowError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Warehouse Inventory"
        actions={
          <Button variant="primary" iconLeading="plus" onClick={() => setForm({ mode: "add" })}>
            Add Warehouse
          </Button>
        }
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-primary">Warehouses</h2>

        {error && <Alert tone="error">Could not load warehouses: {error.message}</Alert>}
        {rowError && <Alert tone="error">{rowError}</Alert>}

        <TableCard>
          <Table density="dense" nowrap>
            <THead>
              <TR>
                <TH width={220}>Warehouse Name</TH>
                <TH width={120}>Code</TH>
                <TH width={200}>Location</TH>
                <TH width={100} align="center">Sections</TH>
                <TH width={100} align="center">Status</TH>
                <TH width={160} align="right">Action</TH>
              </TR>
            </THead>
            <TBody>
              {loading ? (
                <TR>
                  <TD colSpan={6} align="center" className="text-tertiary py-4">
                    Loading warehouses...
                  </TD>
                </TR>
              ) : warehouses.length === 0 ? (
                <TR>
                  <TD colSpan={6} align="center" className="text-tertiary py-4">
                    No warehouses found.
                  </TD>
                </TR>
              ) : (
                warehouses.map((warehouse) => (
                  <TR key={warehouse.id}>
                    <TD className="font-medium text-primary">{warehouse.name}</TD>
                    <TD>{warehouse.code || "—"}</TD>
                    <TD>{warehouse.location || "—"}</TD>
                    <TD align="center">{warehouse.sections_count}</TD>
                    <TD align="center">
                      <Badge tone={warehouse.is_active ? "success" : "neutral"}>
                        {warehouse.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-6">
                        <Button variant="link" onClick={() => setForm({ mode: "edit", warehouse })}>
                          Edit
                        </Button>
                        <Button variant="link" onClick={() => toggleActive(warehouse)}>
                          {warehouse.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </TableCard>
      </section>

      <WarehouseFormDialog
        key={`${form?.mode}-${form?.warehouse?.id ?? "new"}`}
        mode={form?.mode ?? "add"}
        warehouse={form?.warehouse}
        open={form !== null}
        onClose={() => setForm(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
