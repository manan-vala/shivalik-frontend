import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import { getBookInventory, getBooks, totalsByBook } from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { coverInitials, formatINR, stockStatus } from "../../lib/format.js";

/**
 * Every title in the catalog with its stock summed across racks.
 *
 * Two reads joined here: `books/` is the catalog (so a title with no stock
 * still shows, as Out of Stock), `books/inventory/` is the per-rack ledger
 * the totals and locations come from.
 */
async function loadCatalogWithStock() {
  const [books, ledger] = await Promise.all([getBooks(), getBookInventory()]);
  const totals = totalsByBook(ledger);
  return books.map((book) => {
    const stock = totals.get(book.id) ?? { total: 0, racks: [] };
    return { ...book, curr_stock: stock.total, racks: stock.racks };
  });
}

function rackSummary(racks) {
  if (racks.length === 0) return "Unassigned";
  const [first, ...rest] = racks;
  return rest.length ? `${first.rack_location} +${rest.length} more` : first.rack_location;
}

export default function InventoryAllPage() {
  const { data: books, loading, error } = useApiData(loadCatalogWithStock, []);
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="All Inventory" />
        <p className="text-sm text-gray-500 mt-1">Complete catalog of all book titles across every warehouse zone.</p>
      </div>

      {error && <Alert tone="error">Could not load inventory: {error.message}</Alert>}

      <TableCard>
        <Table>
          <THead>
            <TR>
              <TH width={60}>Cover</TH>
              <TH width={250}>Book Name</TH>
              <TH width={120}>Stock</TH>
              <TH width={120}>MRP</TH>
              <TH width={200}>Rack</TH>
              <TH width={100}>Status</TH>
              <TH width={100} align="right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR><TD colSpan={7} align="center" className="py-8 text-gray-500">Loading catalog...</TD></TR>
            ) : books.length === 0 ? (
              <TR><TD colSpan={7} align="center" className="py-8 text-gray-500">No books found.</TD></TR>
            ) : (
              books.map((book) => {
                const status = stockStatus(book.curr_stock, book.min_stock);
                return (
                  <TR key={book.id}>
                    <TD>
                      <div className="w-8 h-8 rounded bg-[#1c2c4c] text-white flex items-center justify-center text-xs font-bold">
                        {coverInitials(book.title)}
                      </div>
                    </TD>
                    <TD>
                      <div className="font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.isbn}</div>
                    </TD>
                    <TD className="font-semibold">{book.curr_stock}</TD>
                    <TD className="text-gray-600">{formatINR(book.mrp)}</TD>
                    <TD className="text-gray-600 truncate max-w-[200px]" title={book.racks.map((r) => r.rack_location).join("\n")}>
                      {rackSummary(book.racks)}
                    </TD>
                    <TD>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedBook(book)}
                          className="text-gray-400 hover:text-primary"
                          aria-label={`View ${book.title}`}
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </div>
                    </TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>

      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div role="dialog" aria-labelledby="book-details-title" className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 id="book-details-title" className="text-xl font-bold">Book Details</h2>
                <p className="text-sm text-gray-500">Complete inventory information</p>
              </div>
              <button onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-gray-700" aria-label="Close">✕</button>
            </div>
            <div className="p-6">
              <div className="flex gap-6 mb-6">
                <div className="w-24 h-32 bg-[#1c2c4c] text-white flex items-center justify-center text-3xl font-bold rounded-lg shadow-sm">
                  {coverInitials(selectedBook.title)}
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h3>
                  <p className="text-gray-500">ISBN: {selectedBook.isbn}</p>
                  {selectedBook.author && <p className="text-gray-500">{selectedBook.author}</p>}
                  <p className="text-gray-500">
                    MRP {formatINR(selectedBook.mrp)} · Minimum stock {selectedBook.min_stock}
                  </p>
                  <div>
                    <Badge tone={stockStatus(selectedBook.curr_stock, selectedBook.min_stock).tone}>
                      Current Stock: {selectedBook.curr_stock}
                    </Badge>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-700 mb-2">Stock by rack</h4>
              {selectedBook.racks.length === 0 ? (
                <p className="text-sm text-gray-500 mb-6">Not stocked on any rack.</p>
              ) : (
                <table className="w-full text-sm mb-6">
                  <tbody>
                    {selectedBook.racks.map((r) => (
                      <tr key={r.rack} className="border-t">
                        <td className="py-2 text-gray-700">{r.rack_location}</td>
                        <td className="py-2 text-gray-500">{r.vendor_name ?? "—"}</td>
                        <td className="py-2 text-right font-semibold">{r.curr_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="flex justify-end gap-4">
                <Button variant="secondary" onClick={() => setSelectedBook(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
