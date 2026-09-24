import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import {
  getBookInventory,
  getLowSellingBooks,
  runCampaign,
  totalsByBook,
} from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { coverInitials } from "../../lib/format.js";

/**
 * `stock/low-selling/` lists the flagged titles (catalog rows, no stock);
 * the ledger supplies how many units each one has tied up, and where.
 */
async function loadLowSelling() {
  const [books, ledger] = await Promise.all([getLowSellingBooks(), getBookInventory()]);
  const totals = totalsByBook(ledger);
  return books.map((book) => {
    const stock = totals.get(book.id) ?? { total: 0, racks: [] };
    return { ...book, curr_stock: stock.total, racks: stock.racks };
  });
}

const EMPTY_CAMPAIGN = { discount: "20", duration: "7", notes: "" };

export default function InventoryLowSellingPage() {
  const { data: books, loading, error } = useApiData(loadLowSelling, []);

  const [selectedBook, setSelectedBook] = useState(null);
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN);
  const [campaignResult, setCampaignResult] = useState("");
  const [campaignError, setCampaignError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(
    () => ({
      stagnantTitles: books.length,
      tiedUpUnits: books.reduce((sum, b) => sum + b.curr_stock, 0),
    }),
    [books]
  );

  const handleCampaignSubmit = async (event) => {
    event.preventDefault();
    const discount = Number(campaignForm.discount);
    if (!Number.isFinite(discount) || discount < 5 || discount > 90) {
      setCampaignError("Discount must be between 5% and 90%.");
      return;
    }

    setSubmitting(true);
    setCampaignError("");
    try {
      const response = await runCampaign(selectedBook.id, {
        discount_percent: discount,
        duration_days: Number(campaignForm.duration),
        notes: campaignForm.notes,
      });
      setCampaignResult(response.detail);
    } catch (err) {
      setCampaignError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeCampaignModal = () => {
    setSelectedBook(null);
    setCampaignResult("");
    setCampaignError("");
    setCampaignForm(EMPTY_CAMPAIGN);
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="Low Selling" />
        <p className="text-sm text-gray-500 mt-1">Identify stagnant inventory and run promotional campaigns to clear stock.</p>
      </div>

      {error && <Alert tone="error">Could not load low-selling titles: {error.message}</Alert>}

      <div>
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Dead Stock Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-purple-200">
            <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Stagnant Titles</span>
            <span className="text-3xl font-bold" data-testid="stagnant-count">{stats.stagnantTitles}</span>
            <span className="text-xs text-purple-600 font-medium">Items moving slowly</span>
          </div>

          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm">
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Excess Units</span>
            <span className="text-3xl font-bold">{stats.tiedUpUnits}</span>
            <span className="text-xs text-gray-500 font-medium">Total physical stock affected</span>
          </div>
        </div>
      </div>

      <TableCard>
        <Table>
          <THead>
            <TR>
              <TH width={60}>Cover</TH>
              <TH width={250}>Book</TH>
              <TH width={120}>Stock Level</TH>
              <TH width={200}>Rack Location</TH>
              <TH width={120}>Status</TH>
              <TH width={120} align="right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR><TD colSpan={6} align="center" className="py-8 text-gray-500">Scanning sales velocity...</TD></TR>
            ) : books.length === 0 ? (
              <TR>
                <TD colSpan={6} align="center" className="py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-gray-900 font-medium">All stock is moving well!</p>
                    <p className="text-sm text-gray-500">No items are currently flagged as low-selling.</p>
                  </div>
                </TD>
              </TR>
            ) : (
              books.map((book) => (
                <TR key={book.id}>
                  <TD>
                    <div className="w-8 h-8 rounded text-white flex items-center justify-center text-xs font-bold bg-[#1c2c4c]">
                      {coverInitials(book.title)}
                    </div>
                  </TD>
                  <TD>
                    <div className="font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">{book.isbn}</div>
                  </TD>
                  <TD className="font-bold text-gray-900">{book.curr_stock}</TD>
                  <TD className="text-gray-600 truncate max-w-[200px]" title={book.racks.map((r) => r.rack_location).join("\n")}>
                    {book.racks.length === 0 ? "Unassigned" : book.racks.length === 1 ? book.racks[0].rack_location : `${book.racks.length} racks`}
                  </TD>
                  <TD>
                    <Badge tone="warning">Low Selling</Badge>
                  </TD>
                  <TD>
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        className="!py-1 !text-xs !bg-purple-600 hover:!bg-purple-700"
                        onClick={() => setSelectedBook(book)}
                        aria-label={`Run campaign for ${book.title}`}
                      >
                        Run Campaign
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </TableCard>

      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-labelledby="campaign-title" className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 id="campaign-title" className="text-xl font-bold">{campaignResult ? "Campaign Launched" : "Run Discount Campaign"}</h2>
              <button onClick={closeCampaignModal} className="text-gray-400 hover:text-gray-700" aria-label="Close">✕</button>
            </div>

            <div className="p-6">
              {campaignResult ? (
                <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900" role="status">{campaignResult}</p>
                  <Button variant="primary" className="mt-4 w-full !bg-purple-600 hover:!bg-purple-700" onClick={closeCampaignModal}>Close</Button>
                </div>
              ) : (
                <form className="flex flex-col gap-5" onSubmit={handleCampaignSubmit} noValidate>
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-16 bg-[#1c2c4c] text-white flex items-center justify-center text-lg font-bold rounded shadow-sm">
                      {coverInitials(selectedBook.title)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedBook.title}</h3>
                      <p className="text-sm text-gray-500">Targeting {selectedBook.curr_stock} stagnant units</p>
                    </div>
                  </div>

                  <hr />

                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Discount Percentage (%):
                      <input
                        type="number"
                        min="5"
                        max="90"
                        className="border rounded p-2 font-normal focus:ring-2 focus:ring-purple-500/50"
                        value={campaignForm.discount}
                        onChange={(e) => setCampaignForm({ ...campaignForm, discount: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Campaign Duration (Days):
                      <select
                        className="border rounded p-2 font-normal focus:ring-2 focus:ring-purple-500/50 bg-white"
                        value={campaignForm.duration}
                        onChange={(e) => setCampaignForm({ ...campaignForm, duration: e.target.value })}
                      >
                        <option value="3">3 Days (Flash Sale)</option>
                        <option value="7">7 Days (Weekly Special)</option>
                        <option value="14">14 Days (Clearance)</option>
                        <option value="30">30 Days (Monthly Promo)</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                      Internal Strategy Notes:
                      <textarea
                        placeholder="Why are we discounting this?"
                        className="border rounded p-2 font-normal focus:ring-2 focus:ring-purple-500/50 h-20"
                        value={campaignForm.notes}
                        onChange={(e) => setCampaignForm({ ...campaignForm, notes: e.target.value })}
                      />
                    </label>
                  </div>

                  {campaignError && <Alert tone="error">{campaignError}</Alert>}

                  <Button type="submit" variant="primary" className="w-full mt-2 !bg-purple-600 hover:!bg-purple-700" disabled={submitting}>
                    {submitting ? "Launching..." : "Launch Campaign"}
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
