import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import {
  createPurchaseOrder,
  getActiveVendors,
  getBook,
  getBookInventory,
  getLowStockBooks,
  totalsByBook,
} from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { coverInitials } from "../../lib/format.js";

// "Critical" is the design's cut-off (Figma copy: "<15 units remaining"),
// a display tier inside low stock — the backend decides what is low.
const CRITICAL_BELOW = 15;

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * `stock/low-stock/` decides which titles are short; the ledger adds who
 * supplied each one, so the reorder can default to that vendor.
 */
async function loadLowStock() {
  const [books, ledger, vendors] = await Promise.all([
    getLowStockBooks(),
    getBookInventory(),
    getActiveVendors(),
  ]);
  const totals = totalsByBook(ledger);
  const rows = books.map((book) => {
    const suppliers = new Map();
    for (const r of totals.get(book.id)?.racks ?? []) {
      if (r.vendor) suppliers.set(r.vendor, r.vendor_name);
    }
    return { ...book, suppliers: [...suppliers].map(([id, name]) => ({ id, name })) };
  });
  return { books: rows, vendors };
}

const EMPTY = { books: [], vendors: [] };

export default function InventoryLowStockPage() {
  const { data, loading, error } = useApiData(loadLowStock, EMPTY);
  const { books, vendors } = data;

  const [selectedBook, setSelectedBook] = useState(null);
  const [reorderForm, setReorderForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reorderError, setReorderError] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  const stats = useMemo(
    () => ({
      lowStock: books.length,
      critical: books.filter((b) => b.curr_stock < CRITICAL_BELOW).length,
      outOfStock: books.filter((b) => b.curr_stock === 0).length,
    }),
    [books]
  );

  const openReorder = (book) => {
    const supplier = book.suppliers.find((s) => vendors.some((v) => v.id === s.id));
    setSelectedBook(book);
    setCreatedOrder(null);
    setReorderError("");
    setReorderForm({
      vendor: String(supplier?.id ?? vendors[0]?.id ?? ""),
      quantity: String(Math.max(book.deficit, 1)),
      date: today(),
      notes: "",
    });
  };

  const closeReorderModal = () => {
    setSelectedBook(null);
    setReorderForm(null);
    setCreatedOrder(null);
    setReorderError("");
  };

  // A draft purchase order with one line. The line is priced at MRP — the
  // same rule the backend's bulk `stock/reorder/` uses — and repriced when
  // the order is confirmed with the vendor.
  const handleReorderSubmit = async (event) => {
    event.preventDefault();
    const quantity = Number(reorderForm.quantity);
    if (!reorderForm.vendor) {
      setReorderError("Choose a vendor to order from.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setReorderError("Reorder quantity must be a whole number of at least 1.");
      return;
    }

    setSubmitting(true);
    setReorderError("");
    try {
      const book = await getBook(selectedBook.id);
      const order = await createPurchaseOrder({
        vendor: Number(reorderForm.vendor),
        status: "DRAFT",
        order_date: reorderForm.date || null,
        notes: reorderForm.notes,
        lines: [
          {
            book: selectedBook.id,
            quantity_ordered: quantity,
            unit_price: book.mrp ?? "0.00",
          },
        ],
      });
      setCreatedOrder(order);
    } catch (err) {
      setReorderError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="Low Stock" />
        <p className="text-sm text-gray-500 mt-1">Titles below their minimum reorder levels — action required.</p>
      </div>

      {error && <Alert tone="error">Could not load low stock: {error.message}</Alert>}

      <div>
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Stock Alert Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-orange-200">
            <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Low Stock Titles</span>
            <span className="text-3xl font-bold" data-testid="low-stock-count">{stats.lowStock}</span>
            <span className="text-xs text-orange-600 font-medium">Below reorder threshold</span>
          </div>

          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-red-200">
            <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Critical Stock</span>
            <span className="text-3xl font-bold">{stats.critical}</span>
            <span className="text-xs text-red-500 font-medium">&lt;{CRITICAL_BELOW} units remaining</span>
          </div>

          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm">
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Out Of Stock</span>
            <span className="text-3xl font-bold">{stats.outOfStock}</span>
            {stats.outOfStock === 0 ? (
              <span className="text-xs text-green-600 font-medium">No stockouts currently</span>
            ) : (
              <span className="text-xs text-red-500 font-medium">No units left anywhere</span>
            )}
          </div>

          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-blue-200">
            <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Units Short</span>
            <span className="text-3xl font-bold">{books.reduce((sum, b) => sum + b.deficit, 0)}</span>
            <span className="text-xs text-blue-600 font-medium">To reach every minimum</span>
          </div>
        </div>
      </div>

      <TableCard>
        <Table>
          <THead>
            <TR>
              <TH width={60}>Cover</TH>
              <TH width={250}>Book</TH>
              <TH width={100}>Current Qty</TH>
              <TH width={100}>Min Qty</TH>
              <TH width={100}>Deficit</TH>
              <TH width={150}>Vendor</TH>
              <TH width={160}>Rack</TH>
              <TH width={100}>Status</TH>
              <TH width={120} align="right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR><TD colSpan={9} align="center" className="py-8 text-gray-500">Scanning inventory...</TD></TR>
            ) : books.length === 0 ? (
              <TR><TD colSpan={9} align="center" className="py-8 text-gray-500">All stock levels are healthy.</TD></TR>
            ) : (
              books.map((book) => {
                const isCritical = book.curr_stock < CRITICAL_BELOW;
                return (
                  <TR key={book.id}>
                    <TD>
                      <div className={`w-8 h-8 rounded text-white flex items-center justify-center text-xs font-bold ${isCritical ? 'bg-red-800' : 'bg-[#1c2c4c]'}`}>
                        {coverInitials(book.title)}
                      </div>
                    </TD>
                    <TD>
                      <div className="font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.isbn}</div>
                    </TD>
                    <TD className={`font-bold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>{book.curr_stock}</TD>
                    <TD className="text-gray-600">{book.min_stock}</TD>
                    <TD className="font-semibold text-red-500">-{book.deficit}</TD>
                    <TD className="text-gray-600 truncate max-w-[150px]">
                      {book.suppliers.length === 0 ? "—" : book.suppliers.map((s) => s.name).join(", ")}
                    </TD>
                    <TD className="text-gray-600 truncate max-w-[160px]" title={book.racks.map((r) => r.rack_location).join("\n")}>
                      {book.racks.length === 0 ? "—" : book.racks.length === 1 ? book.racks[0].rack_location : `${book.racks.length} racks`}
                    </TD>
                    <TD>
                      <Badge tone={isCritical ? "error" : "warning"}>
                        {isCritical ? "Critical" : "Low Stock"}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          className="!py-1 !text-xs !bg-[#1c2c4c]"
                          onClick={() => openReorder(book)}
                          aria-label={`Create reorder for ${book.title}`}
                        >
                          Create Reorder
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

      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="reorder-title" className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 id="reorder-title" className="text-xl font-bold">{createdOrder ? "Reorder Created" : "Reorder Book"}</h2>
              <button onClick={closeReorderModal} className="text-gray-400 hover:text-gray-700" aria-label="Close">✕</button>
            </div>

            <div className="p-6">
              {createdOrder ? (
                <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900" role="status">
                    Purchase order #{createdOrder.id} for <span className="font-bold">{selectedBook.title}</span> created
                    as a draft with {createdOrder.vendor_name}.
                  </p>
                  <Button variant="primary" className="mt-4 w-full" onClick={closeReorderModal}>Close</Button>
                </div>
              ) : (
                <form className="flex flex-col gap-5" onSubmit={handleReorderSubmit} noValidate>
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-16 bg-[#1c2c4c] text-white flex items-center justify-center text-lg font-bold rounded shadow-sm">
                      {coverInitials(selectedBook.title)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedBook.title}</h3>
                      <p className="text-sm text-gray-500">{selectedBook.isbn}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-gray-500">Current Quantity:</div>
                    <div className="font-semibold">{selectedBook.curr_stock}</div>

                    <div className="text-gray-500">Minimum Quantity:</div>
                    <div>{selectedBook.min_stock}</div>

                    <div className="text-gray-500">Deficit:</div>
                    <div className="font-bold text-red-500">-{selectedBook.deficit}</div>
                  </div>

                  <hr />

                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Vendor:
                      <select
                        className="border rounded p-2 font-normal bg-white focus:ring-2 focus:ring-primary/50"
                        value={reorderForm.vendor}
                        onChange={(e) => setReorderForm({ ...reorderForm, vendor: e.target.value })}
                      >
                        <option value="">Select vendor...</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>{v.company_name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Reorder Quantity:
                      <input
                        type="number"
                        min="1"
                        className="border rounded p-2 font-normal focus:ring-2 focus:ring-primary/50"
                        value={reorderForm.quantity}
                        onChange={(e) => setReorderForm({ ...reorderForm, quantity: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Reorder Date:
                      <input
                        type="date"
                        className="border rounded p-2 font-normal focus:ring-2 focus:ring-primary/50"
                        value={reorderForm.date}
                        onChange={(e) => setReorderForm({ ...reorderForm, date: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Reorder Notes:
                      <textarea
                        placeholder="Enter notes here..."
                        className="border rounded p-2 font-normal focus:ring-2 focus:ring-primary/50 h-20"
                        value={reorderForm.notes}
                        onChange={(e) => setReorderForm({ ...reorderForm, notes: e.target.value })}
                      />
                    </label>
                  </div>

                  {reorderError && <Alert tone="error">{reorderError}</Alert>}

                  <Button type="submit" variant="primary" className="w-full mt-2" disabled={submitting}>
                    {submitting ? "Creating..." : "Submit Reorder"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
