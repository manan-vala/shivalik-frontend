import { useState, useEffect } from "react";
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
import Button from "../../components/ui/Button.jsx";

export default function InventoryPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch(`${API_BASE}/inventory/warehouses/`);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();
        setWarehouses(data.results);
      } catch (err) {
        console.error("Error fetching warehouses:", err);
        setError("Could not load warehouse data. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader title="Warehouse Inventory" />

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-primary">Active Warehouses</h2>
          <Button variant="primary" iconLeading="plus">Add Warehouse</Button>
        </div>

        {error ? (
          <div className="text-red-500 p-4 border border-red-200 rounded">{error}</div>
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