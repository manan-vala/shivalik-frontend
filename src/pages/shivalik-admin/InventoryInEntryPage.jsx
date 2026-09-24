import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Button from "../../components/ui/Button.jsx";
import {
  findBookByIsbn,
  getActiveVendors,
  getRacks,
  rackLabel,
  registerBook,
  stockIn,
} from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { coverInitials, formatINR } from "../../lib/format.js";

/**
 * IN Entry — stock received from a vendor.
 *
 * Each line is one title onto one rack. A title already in the catalog is
 * found by ISBN; a new one is registered first (title + ISBN + MRP), then the
 * units are booked in with `books/{id}/stock-in/`.
 *
 * The backend has no batch stock-in, so lines are sent one at a time, in
 * order. If one is refused, the lines before it are already booked: they are
 * taken off the form so a retry cannot book them twice, and the refused line
 * stays with the error.
 */

async function loadFormData() {
  const [vendors, racks] = await Promise.all([getActiveVendors(), getRacks()]);
  return { vendors, racks: racks.filter((r) => r.is_active) };
}

let nextKey = 1;
function emptyLine() {
  return { key: nextKey++, isbn: "", lookup: "idle", book: null, title: "", mrp: "", qty: "", rack: "" };
}

export default function InventoryInEntryPage() {
  const { data, loading, error } = useApiData(loadFormData, { vendors: [], racks: [] });
  const { vendors, racks } = data;

  const [vendorId, setVendorId] = useState("");
  const [lines, setLines] = useState(() => [emptyLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { tone, message }

  const vendor = vendors.find((v) => String(v.id) === vendorId);

  // `patch` is an object, or a function of the row as it is *now* — for
  // results that land after the user may have kept typing.
  const updateLine = (key, patch) =>
    setLines((current) =>
      current.map((line) =>
        line.key === key ? { ...line, ...(typeof patch === "function" ? patch(line) : patch) } : line
      )
    );

  const addRow = () => setLines((current) => [...current, emptyLine()]);

  const removeRow = (key) =>
    setLines((current) => (current.length > 1 ? current.filter((line) => line.key !== key) : current));

  // Look the ISBN up in the catalog as soon as it is entered, so the row
  // shows whether this is a known title or a new one to register.
  const lookUpIsbn = async (line) => {
    const isbn = line.isbn.trim();
    if (!isbn || (line.book && line.book.isbn === isbn)) return;

    updateLine(line.key, { lookup: "checking", book: null });
    // Applied to the row as it is when the answer arrives — the user may have
    // picked a rack meanwhile (keep it), or changed the ISBN (drop the answer).
    const settle = (patch) =>
      updateLine(line.key, (current) => (current.isbn.trim() === isbn ? patch(current) : {}));

    try {
      const book = await findBookByIsbn(isbn);
      if (book) {
        settle((current) => ({
          lookup: "found",
          book,
          title: book.title,
          mrp: book.mrp ?? "",
          rack: current.rack || (book.default_rack ? String(book.default_rack) : ""),
        }));
      } else {
        settle(() => ({ lookup: "new", book: null }));
      }
    } catch (err) {
      settle(() => ({ lookup: "error", book: null }));
      setResult({ tone: "error", message: `Could not look up ISBN ${isbn}: ${err.message}` });
    }
  };

  const summary = useMemo(() => {
    let units = 0;
    let value = 0;
    for (const line of lines) {
      const qty = Number(line.qty) || 0;
      units += qty;
      value += qty * (Number(line.mrp) || 0);
    }
    return { units, value };
  }, [lines]);

  /**
   * Every line checked against the catalog *now*. A lookup started on blur
   * may still be in flight — clicking "Add To Inventory" straight from the
   * ISBN field blurs it — so validation cannot trust `line.book` alone, or
   * it would ask for a name and MRP for a title the catalog already has.
   */
  async function resolveLines(current) {
    return Promise.all(
      current.map(async (line) => {
        const isbn = line.isbn.trim();
        if (!isbn) return line;
        const book = line.book?.isbn === isbn ? line.book : await findBookByIsbn(isbn);
        return book
          ? { ...line, lookup: "found", book, title: book.title, mrp: book.mrp ?? "" }
          : { ...line, lookup: "new", book: null };
      })
    );
  }

  function validate(resolved) {
    for (const [index, line] of resolved.entries()) {
      const label = `Line ${index + 1}`;
      const qty = Number(line.qty);
      if (!line.isbn.trim()) return `${label}: enter an ISBN.`;
      if (!Number.isInteger(qty) || qty < 1) return `${label}: quantity must be a whole number of at least 1.`;
      if (!line.rack) return `${label}: choose the rack the books go on.`;
      if (!line.book) {
        if (!line.title.trim()) return `${label}: a new title needs a book name.`;
        if (line.mrp === "" || Number(line.mrp) < 0) return `${label}: a new title needs an MRP.`;
      }
    }
    return null;
  }

  const handleSubmit = async () => {
    if (!vendorId) {
      setResult({ tone: "error", message: "Choose the vendor this delivery came from." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    let resolved;
    try {
      resolved = await resolveLines(lines);
    } catch (err) {
      setResult({ tone: "error", message: `Could not check the catalog: ${err.message}` });
      setSubmitting(false);
      return;
    }
    // Show what the catalog said, whether or not the entry goes ahead.
    const byKey = new Map(resolved.map((line) => [line.key, line]));
    setLines((current) => current.map((line) => byKey.get(line.key) ?? line));

    const problem = validate(resolved);
    if (problem) {
      setResult({ tone: "error", message: problem });
      setSubmitting(false);
      return;
    }

    const booked = [];
    // Titles registered by this entry, so a second line with the same new
    // ISBN stocks that book instead of trying to register it again.
    const registered = new Map();

    for (const [index, line] of resolved.entries()) {
      const isbn = line.isbn.trim();
      try {
        let book = line.book ?? registered.get(isbn);
        if (!book) {
          book = await registerBook({ title: line.title.trim(), isbn, mrp: line.mrp });
          registered.set(isbn, book);
        }
        await stockIn(book.id, {
          rack: Number(line.rack),
          vendor: Number(vendorId),
          quantity: Number(line.qty),
        });
        booked.push({ key: line.key, title: book.title, qty: Number(line.qty) });
      } catch (err) {
        const bookedKeys = new Set(booked.map((b) => b.key));
        setLines((current) => current.filter((l) => !bookedKeys.has(l.key)));
        const saved = booked.length
          ? ` ${booked.length} line(s) before it were booked in and removed from the form.`
          : "";
        setResult({
          tone: "error",
          message: `Line ${index + 1} (ISBN ${isbn}) was not booked in: ${err.message}${saved}`,
        });
        setSubmitting(false);
        return;
      }
    }

    const units = booked.reduce((sum, b) => sum + b.qty, 0);
    setResult({
      tone: "success",
      message: `Booked in ${units} units across ${booked.length} title(s) from ${vendor.company_name}.`,
    });
    const bookedKeys = new Set(booked.map((b) => b.key));
    setLines((current) => {
      const rest = current.filter((l) => !bookedKeys.has(l.key));
      return rest.length ? rest : [emptyLine()];
    });
    setSubmitting(false);
  };

  const handleCancel = () => {
    setVendorId("");
    setLines([emptyLine()]);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <div>
        <PageHeader title="IN Entry" />
        <p className="text-sm text-gray-500 mt-1">Record incoming stock received from vendors.</p>
      </div>

      {error && <Alert tone="error">Could not load vendors and racks: {error.message}</Alert>}

      {/* Frozen while saving: the lines being sent must not change underneath. */}
      <fieldset disabled={submitting} className="contents">
        <Card title="Vendor Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Vendor Name *
              <select
                className="border rounded p-2 font-normal bg-white focus:ring-2 focus:ring-primary/50"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                disabled={loading}
              >
                <option value="">{loading ? "Loading vendors..." : "Select vendor..."}</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.company_name}</option>
                ))}
              </select>
            </label>
            {vendor && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm self-end">
                <dt className="text-gray-500">Contact</dt>
                <dd className="text-gray-900">{vendor.contact_person || vendor.vendor_name}</dd>
                <dt className="text-gray-500">GSTIN</dt>
                <dd className="text-gray-900">{vendor.gst_number}</dd>
                <dt className="text-gray-500">Payment terms</dt>
                <dd className="text-gray-900">{vendor.payment_terms || "—"}</dd>
              </dl>
            )}
          </div>
        </Card>

        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-t-lg border border-b-0">
            <h2 className="text-lg font-medium text-gray-900">Books Received</h2>
            <Button variant="primary" iconLeading="plus" onClick={addRow}>Add Book</Button>
          </div>
          <div className="mt-[-16px]">
            <TableCard>
              <Table>
                <THead>
                  <TR>
                    <TH width={60}>Cover</TH>
                    <TH width={170}>ISBN</TH>
                    <TH width={240}>Book Name</TH>
                    <TH width={110}>MRP</TH>
                    <TH width={90}>Qty</TH>
                    <TH width={240}>Rack</TH>
                    <TH width={60} align="center">Action</TH>
                  </TR>
                </THead>
                <TBody>
                  {lines.map((line, index) => {
                    const known = line.lookup === "found";
                    return (
                      <TR key={line.key} data-testid={`in-line-${index + 1}`}>
                        <TD>
                          <div className="w-8 h-8 rounded bg-[#1c2c4c] text-white flex items-center justify-center text-xs font-bold">
                            {line.title ? coverInitials(line.title) : "?"}
                          </div>
                        </TD>
                        <TD>
                          <input
                            type="text"
                            placeholder="ISBN"
                            aria-label={`ISBN, line ${index + 1}`}
                            className="w-full border rounded p-1"
                            maxLength={20}
                            value={line.isbn}
                            onChange={(e) => {
                              const isbn = e.target.value;
                              // A different ISBN is a different book: drop what
                              // the catalog filled in for the old one.
                              updateLine(line.key, (current) => ({
                                isbn,
                                lookup: "idle",
                                book: null,
                                ...(current.book ? { title: "", mrp: "" } : {}),
                              }));
                            }}
                            onBlur={() => lookUpIsbn(line)}
                          />
                          <div className="text-xs mt-1 h-4 text-gray-500">
                            {line.lookup === "checking" && "Checking catalog..."}
                            {line.lookup === "found" && <span className="text-green-700">In catalog</span>}
                            {line.lookup === "new" && <span className="text-blue-700">New title — will be registered</span>}
                          </div>
                        </TD>
                        <TD>
                          <input
                            type="text"
                            placeholder="Title..."
                            aria-label={`Book name, line ${index + 1}`}
                            className="w-full border rounded p-1 read-only:bg-gray-50"
                            value={line.title}
                            readOnly={known}
                            onChange={(e) => updateLine(line.key, { title: e.target.value })}
                          />
                        </TD>
                        <TD>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            aria-label={`MRP, line ${index + 1}`}
                            className="w-full border rounded p-1 read-only:bg-gray-50"
                            value={line.mrp}
                            readOnly={known}
                            onChange={(e) => updateLine(line.key, { mrp: e.target.value })}
                          />
                        </TD>
                        <TD>
                          <input
                            type="number"
                            min="1"
                            aria-label={`Quantity, line ${index + 1}`}
                            className="w-full border rounded p-1"
                            value={line.qty}
                            onChange={(e) => updateLine(line.key, { qty: e.target.value })}
                          />
                        </TD>
                        <TD>
                          <select
                            aria-label={`Rack, line ${index + 1}`}
                            className="w-full border rounded p-1 bg-white"
                            value={line.rack}
                            onChange={(e) => updateLine(line.key, { rack: e.target.value })}
                          >
                            <option value="">Select rack...</option>
                            {racks.map((r) => (
                              <option key={r.id} value={r.id}>{rackLabel(r)}</option>
                            ))}
                          </select>
                        </TD>
                        <TD align="center">
                          <button
                            onClick={() => removeRow(line.key)}
                            className="text-red-500 hover:text-red-700 font-bold p-2"
                            aria-label={`Remove line ${index + 1}`}
                          >
                            ✕
                          </button>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableCard>
          </div>
        </section>
      </fieldset>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="border bg-white rounded-lg p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Total Books</span>
          <span className="text-3xl font-bold">{lines.length}</span>
          <span className="text-xs text-gray-400">Titles on this entry</span>
        </div>
        <div className="border bg-white rounded-lg p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Total Units</span>
          <span className="text-3xl font-bold">{summary.units}</span>
          <span className="text-xs text-gray-400">Copies received</span>
        </div>
        <div className="border bg-white rounded-lg p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Value at MRP</span>
          <span className="text-3xl font-bold">{formatINR(summary.value)}</span>
          <span className="text-xs text-gray-400">Units × MRP</span>
        </div>
      </div>

      {result && <Alert tone={result.tone}>{result.message}</Alert>}

      <div className="flex justify-end gap-4 pb-8">
        <Button variant="secondary" onClick={handleCancel} disabled={submitting}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting || loading}>
          {submitting ? "Adding..." : "Add To Inventory"}
        </Button>
      </div>
    </div>
  );
}
