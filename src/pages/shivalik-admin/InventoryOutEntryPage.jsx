import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Button from "../../components/ui/Button.jsx";
import { getActiveVendors, getBookInventory, stockOut } from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { useAuth } from "../../lib/auth-context.js";

/**
 * OUT Entry — books leaving a rack, through `books/{id}/stock-out/`.
 *
 * Stock sits per (book, rack), so what gets picked here is a ledger row: a
 * title *on a particular rack*, with that rack's balance as the ceiling. The
 * movement is booked against the signed-in employee by the backend.
 */

async function loadStock() {
  const [ledger, vendors] = await Promise.all([getBookInventory(), getActiveVendors()]);
  return { rows: ledger.filter((row) => row.curr_stock > 0), vendors };
}

/**
 * `stock-out/` still requires a vendor on every request, though an outbound
 * movement records none (see the backend's `stock_out`). Send the vendor
 * that supplied the row, or any active one if that vendor has been blocked —
 * the backend refuses a blocked vendor even here.
 */
function vendorForStockOut(row, vendors) {
  if (vendors.some((v) => v.id === row.vendor)) return row.vendor;
  return vendors[0]?.id ?? null;
}

const MAX_MATCHES = 8;

export default function InventoryOutEntryPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApiData(loadStock, { rows: [], vendors: [] });
  const { rows, vendors } = data;

  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState([]); // [{ row, qty }]
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { tone, message }

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const taken = new Set(selected.map((s) => s.row.id));
    return rows
      .filter((row) => !taken.has(row.id))
      .filter((row) => row.book_title.toLowerCase().includes(q) || row.isbn.toLowerCase().includes(q))
      .slice(0, MAX_MATCHES);
  }, [rows, searchQuery, selected]);

  const addRow = (row) => {
    setSelected((current) => [...current, { row, qty: "1" }]);
    setSearchQuery("");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && matches.length > 0) {
      e.preventDefault();
      addRow(matches[0]);
    }
  };

  const removeRow = (rowId) => setSelected((current) => current.filter((s) => s.row.id !== rowId));

  const setQty = (rowId, qty) =>
    setSelected((current) => current.map((s) => (s.row.id === rowId ? { ...s, qty } : s)));

  const totalUnits = selected.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);

  function validate() {
    if (selected.length === 0) return "Add at least one book to take out.";
    if (vendors.length === 0) return "No active vendor exists, and the backend requires one on every stock-out.";
    for (const { row, qty } of selected) {
      const n = Number(qty);
      if (!Number.isInteger(n) || n < 1) return `${row.book_title}: quantity must be a whole number of at least 1.`;
      if (n > row.curr_stock) return `${row.book_title}: only ${row.curr_stock} available on ${row.rack_location}.`;
    }
    return null;
  }

  const handleSubmit = async () => {
    const problem = validate();
    if (problem) {
      setResult({ tone: "error", message: problem });
      return;
    }

    setSubmitting(true);
    setResult(null);
    const done = [];

    for (const { row, qty } of selected) {
      try {
        await stockOut(row.book, {
          rack: row.rack,
          vendor: vendorForStockOut(row, vendors),
          quantity: Number(qty),
        });
        done.push({ id: row.id, qty: Number(qty) });
      } catch (err) {
        const doneIds = new Set(done.map((d) => d.id));
        setSelected((current) => current.filter((s) => !doneIds.has(s.row.id)));
        const saved = done.length
          ? ` ${done.length} line(s) before it were booked out and removed from the list.`
          : "";
        setResult({
          tone: "error",
          message: `${row.book_title} (${row.rack_location}) was not booked out: ${err.message}${saved}`,
        });
        setSubmitting(false);
        reload();
        return;
      }
    }

    const units = done.reduce((sum, d) => sum + d.qty, 0);
    setResult({ tone: "success", message: `Booked out ${units} units across ${done.length} line(s).` });
    setSelected([]);
    setSubmitting(false);
    reload();
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="OUT Entry" />
        <p className="text-sm text-gray-500 mt-1">Record books leaving a rack — dispatch, damage or a move to another location.</p>
      </div>

      {error && <Alert tone="error">Could not load stock: {error.message}</Alert>}

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Books to Take Out</h3>
              <p className="text-sm text-gray-500 mt-1">
                Recorded by <span className="font-medium text-gray-700">{user?.name || user?.email}</span>
              </p>
            </div>

            <div className="relative w-96">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                role="combobox"
                aria-expanded={matches.length > 0}
                aria-controls="out-entry-matches"
                aria-label="Search and add book"
                placeholder={loading ? "Loading stock..." : "Search by title or ISBN..."}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-md focus:bg-white focus:ring-2 focus:ring-primary/50 text-sm"
                value={searchQuery}
                disabled={loading}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              {searchQuery.trim() && (
                <ul
                  id="out-entry-matches"
                  role="listbox"
                  className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto"
                >
                  {matches.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-500">No stocked book matches.</li>
                  ) : (
                    matches.map((row) => (
                      <li key={row.id} role="option" aria-selected="false">
                        <button
                          type="button"
                          onClick={() => addRow(row)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium text-gray-900">{row.book_title}</div>
                          <div className="text-xs text-gray-500">
                            {row.isbn} · {row.rack_location} · {row.curr_stock} available
                          </div>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-1">No books added yet</h4>
              <p className="text-sm text-gray-500">Search above to add books to this entry</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <THead>
                  <TR>
                    <TH width={260}>Book Title</TH>
                    <TH width={160}>ISBN</TH>
                    <TH width={240}>Rack</TH>
                    <TH width={100}>Available</TH>
                    <TH width={120}>Out Qty</TH>
                    <TH width={80} align="center">Action</TH>
                  </TR>
                </THead>
                <TBody>
                  {selected.map(({ row, qty }) => (
                    <TR key={row.id} data-testid={`out-line-${row.id}`}>
                      <TD className="font-medium text-gray-900">{row.book_title}</TD>
                      <TD className="text-gray-500">{row.isbn}</TD>
                      <TD className="text-gray-500">{row.rack_location}</TD>
                      <TD className="text-gray-500">{row.curr_stock}</TD>
                      <TD>
                        <input
                          type="number"
                          min="1"
                          max={row.curr_stock}
                          aria-label={`Out quantity for ${row.book_title}`}
                          className="w-24 border rounded p-1"
                          value={qty}
                          onChange={(e) => setQty(row.id, e.target.value)}
                        />
                      </TD>
                      <TD align="center">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          aria-label={`Remove ${row.book_title}`}
                        >
                          ✕
                        </button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {result && <Alert tone={result.tone}>{result.message}</Alert>}

      <div className="flex justify-end items-center gap-4 pb-8">
        <span className="text-sm text-gray-500 mr-auto">{totalUnits} units selected</span>
        <Button
          variant="secondary"
          className="px-6"
          disabled={submitting}
          onClick={() => {
            setSelected([]);
            setResult(null);
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" className="px-6 flex gap-2 items-center" onClick={handleSubmit} disabled={submitting || loading}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          {submitting ? "Booking out..." : "Complete OUT Entry"}
        </Button>
      </div>
    </div>
  );
}
