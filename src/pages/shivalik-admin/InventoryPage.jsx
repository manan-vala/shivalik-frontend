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
import Button from "../../components/ui/Button.jsx";
import { getWarehouses } from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";

export default function InventoryPage() {
  const { data: warehouses, loading, error } = useApiData(getWarehouses, []);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader title="Warehouse Inventory" />

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-primary">Active Warehouses</h2>
          <Button variant="primary" iconLeading="plus">Add Warehouse</Button>
        </div>

        {error ? (
          <Alert tone="error">Could not load warehouses: {error.message}</Alert>
        ) : (
          <TableCard>
            <Table>
              <THead>
                <TR>
                  <TH width={80}>ID</TH>
                  <TH width={300}>Warehouse Name</TH>
                  <TH width={200}>Created At</TH>
                  <TH width={100} align="right">Action</TH>
                </TR>
              </THead>
              <TBody>
                {loading ? (
                  <TR>
                    <TD colSpan={4} align="center" className="text-gray-500 py-4">
                      Loading warehouses...
                    </TD>
                  </TR>
                ) : warehouses.length === 0 ? (
                  <TR>
                    <TD colSpan={4} align="center" className="text-gray-500 py-4">
                      No warehouses found.
                    </TD>
                  </TR>
                ) : (
                  warehouses.map((warehouse) => (
                    <TR key={warehouse.id}>
                      <TD className="text-primary">{warehouse.id}</TD>
                      <TD className="font-medium text-primary">{warehouse.name}</TD>
                      <TD>{new Date(warehouse.created_at).toLocaleDateString()}</TD>
                      <TD>
                        <div className="flex justify-end">
                          <Button variant="link">View Sections</Button>
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </TableCard>
        )}
      </section>
    </div>
  );
}