import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";

export default function InventoryLowSellingPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Campaign Modal states
  const [selectedBook, setSelectedBook] = useState(null);
  const [campaignSuccess, setCampaignSuccess] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ discount: "20", duration: "7", notes: "" });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE}/inventory/books/inventory/`);
        if (!response.ok) throw new Error("Failed to fetch inventory");
        
        const data = await response.json();
        const booksArray = Array.isArray(data) ? data : (data.results || []);
        
        // Filter ONLY books that are flagged as low_selling by the backend
        // TODO (Backend): The /books/inventory/ endpoint is missing the 'low_selling' boolean from the Catalog.
// Temporary bypass applied to show UI. 
// Change back to: const lowSelling = booksArray.filter(b => b.low_selling === true);
       const lowSelling = booksArray.filter(b => (b.curr_stock || 0) > 0);
        setBooks(lowSelling);
      } catch (err) {
        console.error("Error fetching low selling stock:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Calculate stats for the top summary cards
  const stats = useMemo(() => {
    let totalUnits = 0;
    books.forEach(b => { totalUnits += (b.curr_stock || 0); });
    
    return {
      stagnantTitles: books.length,
      tiedUpUnits: totalUnits,
    };
  }, [books]);

  // Handle the Campaign Form Submission
  const handleCampaignSubmit = async () => {
    // In a real app, you would POST this to a /promotions/ or /campaigns/ endpoint
    console.log("Submitting Campaign:", {
      book_id: selectedBook.id,
      ...campaignForm
    });
    
    // Simulate successful API call
    setCampaignSuccess(true);
  };

  const closeCampaignModal = () => {
    setSelectedBook(null);
    setCampaignSuccess(false);
    setCampaignForm({ discount: "20", duration: "7", notes: "" });
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="Low Selling" />
        <p className="text-sm text-gray-500 mt-1">Identify stagnant inventory and run promotional campaigns to clear stock.</p>
      </div>

      {/* DEAD STOCK SUMMARY CARDS */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Dead Stock Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-purple-200">
            <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Stagnant Titles</span>
            <span className="text-3xl font-bold">{stats.stagnantTitles}</span>
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

          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-green-200">
            <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Active Campaigns</span>
            <span className="text-3xl font-bold">0</span>
            <span className="text-xs text-green-600 font-medium">Currently running promotions</span>
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
              <TH width={150}>Rack Location</TH>
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
              books.map((book) => {
                const stock = book.curr_stock || 0;
                
                return (
                  <TR key={book.id}>
                    <TD>
                      <div className="w-8 h-8 rounded text-white flex items-center justify-center text-xs font-bold bg-[#1c2c4c]">
                        {book.book_title ? book.book_title.substring(0, 2).toUpperCase() : 'BK'}
                      </div>
                    </TD>
                    <TD>
                      <div className="font-medium text-gray-900">{book.book_title || "Unknown Title"}</div>
                      <div className="text-sm text-gray-500">{book.isbn}</div>
                    </TD>
                    <TD className="font-bold text-gray-900">{stock}</TD>
                    <TD className="text-gray-600 truncate max-w-[150px]">{book.rack_location || "Unassigned"}</TD>
                    <TD>
                      <Badge tone="warning">Dead Stock</Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end">
                        <Button 
                          variant="primary" 
                          className="!py-1 !text-xs !bg-purple-600 hover:!bg-purple-700"
                          onClick={() => setSelectedBook(book)}
                        >
                          Run Campaign
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

      {/* CAMPAIGN MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{campaignSuccess ? "Campaign Launched" : "Run Discount Campaign"}</h2>
              <button onClick={closeCampaignModal} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            
            <div className="p-6">
              {campaignSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    Discount campaign for <span className="font-bold">{selectedBook.book_title}</span> is now active!
                  </p>
                  <Button variant="primary" className="mt-4 w-full !bg-purple-600 hover:!bg-purple-700" onClick={closeCampaignModal}>Close</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-4 items-center">
                     <div className="w-12 h-16 bg-[#1c2c4c] text-white flex items-center justify-center text-lg font-bold rounded shadow-sm">
                      {selectedBook.book_title ? selectedBook.book_title.substring(0, 2).toUpperCase() : 'BK'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedBook.book_title}</h3>
                      <p className="text-sm text-gray-500">Targeting {selectedBook.curr_stock || 0} stagnant units</p>
                    </div>
                  </div>

                  <hr />

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Discount Percentage (%):</label>
                      <input 
                        type="number" 
                        min="5"
                        max="90"
                        className="border rounded p-2 focus:ring-2 focus:ring-purple-500/50"
                        value={campaignForm.discount}
                        onChange={(e) => setCampaignForm({...campaignForm, discount: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Campaign Duration (Days):</label>
                      <select 
                        className="border rounded p-2 focus:ring-2 focus:ring-purple-500/50 bg-white"
                        value={campaignForm.duration}
                        onChange={(e) => setCampaignForm({...campaignForm, duration: e.target.value})}
                      >
                        <option value="3">3 Days (Flash Sale)</option>
                        <option value="7">7 Days (Weekly Special)</option>
                        <option value="14">14 Days (Clearance)</option>
                        <option value="30">30 Days (Monthly Promo)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Internal Strategy Notes:</label>
                      <textarea 
                        placeholder="Why are we discounting this?" 
                        className="border rounded p-2 focus:ring-2 focus:ring-purple-500/50 h-20"
                        value={campaignForm.notes}
                        onChange={(e) => setCampaignForm({...campaignForm, notes: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button variant="primary" className="w-full mt-2 !bg-purple-600 hover:!bg-purple-700" onClick={handleCampaignSubmit}>
                    Launch Campaign
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}