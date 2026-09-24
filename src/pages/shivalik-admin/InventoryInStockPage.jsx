import { useMemo, useState } from "react";
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
import { getInStockBooks } from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { coverInitials, stockStatus } from "../../lib/format.js";

/** Titles holding stock anywhere — `stock/in-stock/`, totalled across racks. */
export default function InventoryInStockPage() {
  const { data: books, loading, error } = useApiData(getInStockBooks, []);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) => b.title.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q)
    );
  }, [books, query]);

  const healthyCount = books.filter((b) => b.curr_stock >= b.min_stock).length;

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">In Stock</h1>
        <p className="text-sm text-gray-500 mt-1">Titles with stock available in at least one rack.</p>
      </div>

      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Healthy Stock Levels</h3>
            <p className="text-sm text-green-700">
              {healthyCount} of {books.length} titles are at or above their minimum threshold
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-3xl font-bold text-green-600" data-testid="in-stock-count">{books.length}</span>
          <span className="text-sm text-green-700">Titles in stock</span>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="search"
            placeholder="Search in-stock items..."
            aria-label="Search in-stock items"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        {error ? (
          <Alert tone="error">Could not load stock levels: {error.message}</Alert>
        ) : (
          <TableCard>
            <Table>
              <THead>
                <TR>
                  <TH width={60}>Cover</TH>
                  <TH width={250}>Title</TH>
                  <TH width={150}>ISBN</TH>
                  <TH width={120}>Qty Available</TH>
                  <TH width={120}>Reorder Level</TH>
                  <TH width={200}>Zone</TH>
                  <TH width={100} align="right">Status</TH>
                </TR>
              </THead>
              <TBody>
                {loading ? (
                  <TR>
                    <TD colSpan={7} align="center" className="text-gray-500 py-8">
                      Loading stock levels...
                    </TD>
                  </TR>
                ) : visible.length === 0 ? (
                  <TR>
                    <TD colSpan={7} align="center" className="text-gray-500 py-8">
                      No books found.
                    </TD>
                  </TR>
                ) : (
                  visible.map((book) => {
                    const status = stockStatus(book.curr_stock, book.min_stock);
                    const zones = book.racks.filter((r) => r.curr_stock > 0);
                    return (
                      <TR key={book.id}>
                        <TD>
                          <div className="w-8 h-8 rounded bg-[#1c2c4c] text-white flex items-center justify-center text-xs font-bold">
                            {coverInitials(book.title)}
                          </div>
                        </TD>
                        <TD className="font-medium text-gray-900">{book.title}</TD>
                        <TD className="text-gray-600">{book.isbn}</TD>
                        <TD className="font-semibold text-green-600">{book.curr_stock}</TD>
                        <TD className="text-gray-600">{book.min_stock}</TD>
                        <TD className="text-gray-600 truncate max-w-[200px]" title={zones.map((r) => `${r.rack_location}: ${r.curr_stock}`).join("\n")}>
                          {zones.length === 1 ? zones[0].rack_location : `${zones.length} racks`}
                        </TD>
                        <TD>
                          <div className="flex justify-end">
                            <Badge tone={status.tone}>{status.label}</Badge>
                          </div>
                        </TD>
                      </TR>
                    );
                  })
                )}
              </TBody>
            </Table>
          </TableCard>
        )}
      </section>
    </div>
  );
}
