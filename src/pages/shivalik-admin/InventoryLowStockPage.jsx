import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";

export default function InventoryLowStockPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedBook, setSelectedBook] = useState(null);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const [reorderForm, setReorderForm] = useState({ quantity: "", date: "", notes: "" });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE}/inventory/books/inventory/`);
        if (!response.ok) throw new Error("Failed to fetch inventory");
        
        const data = await response.json();
        const booksArray = Array.isArray(data) ? data : (data.results || []);
        
        // Filter ONLY books that are below their minimum stock threshold.
        // We use a fallback of 50 for min_stock if the backend sends 0 or null.
        const lowStock = booksArray.filter(b => (b.curr_stock || 0) < (b.min_stock || 50));
        setBooks(lowStock);
      } catch (err) {
        console.error("Error fetching low stock:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Calculate stats for the top summary cards
  const stats = useMemo(() => {
    return {
      lowStock: books.length,
      critical: books.filter(b => (b.curr_stock || 0) < 15).length,
      outOfStock: books.filter(b => (b.curr_stock || 0) === 0).length,
      reorderRequired: books.length // Assuming all low stock items need reorder action
    };
  }, [books]);

  // Handle the Reorder Form Submission
  const handleReorderSubmit = async () => {
    // In a real app, you would POST this to a /purchase-orders/ endpoint
    console.log("Submitting Reorder:", {
      book_id: selectedBook.id,
      ...reorderForm
    });
    
    // Simulate successful API call
    setReorderSuccess(true);
  };

  const closeReorderModal = () => {
    setSelectedBook(null);
    setReorderSuccess(false);
    setReorderForm({ quantity: "", date: "", notes: "" });
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="Low Stock" />
        <p className="text-sm text-gray-500 mt-1">Titles approaching or below minimum reorder levels — action required.</p>
      </div>

      {/* STOCK ALERT SUMMARY CARDS */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Stock Alert Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-orange-200">
            <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Low Stock Titles</span>
            <span className="text-3xl font-bold">{stats.lowStock}</span>
            <span className="text-xs text-orange-600 font-medium">Below reorder threshold</span>
          </div>
          
          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-red-200">
            <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Critical Stock</span>
            <span className="text-3xl font-bold">{stats.critical}</span>
            <span className="text-xs text-red-500 font-medium">&lt;15 units remaining</span>
          </div>

          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm">
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Out Of Stock</span>
            <span className="text-3xl font-bold">{stats.outOfStock}</span>
            <span className="text-xs text-green-600 font-medium">No stockouts currently</span>
          </div>

          <div className="border bg-white rounded-lg p-5 flex flex-col gap-2 shadow-sm border-blue-200">
            <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="text-sm text-gray-500 font-medium">Reorder Required</span>
            <span className="text-3xl font-bold">{stats.reorderRequired}</span>
            <span className="text-xs text-blue-600 font-medium">Action needed</span>
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
              <TH width={120}>Rack</TH>
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
                const stock = book.curr_stock || 0;
                const minQty = book.min_stock || 50;
                const deficit = minQty - stock;
                const isCritical = stock < 15;
                
                return (
                  <TR key={book.id}>
                    <TD>
                      <div className={`w-8 h-8 rounded text-white flex items-center justify-center text-xs font-bold ${isCritical ? 'bg-red-800' : 'bg-[#1c2c4c]'}`}>
                        {book.book_title ? book.book_title.substring(0, 2).toUpperCase() : 'BK'}
                      </div>
                    </TD>
                    <TD>
                      <div className="font-medium text-gray-900">{book.book_title || "Unknown Title"}</div>
                      <div className="text-sm text-gray-500">{book.isbn}</div>
                    </TD>
                    <TD className={`font-bold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>{stock}</TD>
                    <TD className="text-gray-600">{minQty}</TD>
                    <TD className="font-semibold text-red-500">-{deficit}</TD>
                    <TD className="text-gray-600 truncate max-w-[150px]">{book.vendor_name || "Multiple Vendors"}</TD>
                    <TD className="text-gray-600 truncate max-w-[120px]">{book.rack_location || "-"}</TD>
                    <TD>
                      <Badge tone={isCritical ? "critical" : "warning"}>
                        {isCritical ? "Critical" : "Low Stock"}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end">
                        <Button 
                          variant="primary" 
                          className="!py-1 !text-xs !bg-[#1c2c4c]"
                          onClick={() => {
                            setSelectedBook(book);
                            setReorderForm({ ...reorderForm, quantity: deficit });
                          }}
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

      {/* REORDER MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{reorderSuccess ? "Reorder Created" : "Reorder Book"}</h2>
              <button onClick={closeReorderModal} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            
            <div className="p-6">
              {reorderSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    Reorder for <span className="font-bold">{selectedBook.book_title}</span> has been successfully created.
                  </p>
                  <Button variant="primary" className="mt-4 w-full" onClick={closeReorderModal}>Close</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-4 items-center">
                     <div className="w-12 h-16 bg-[#1c2c4c] text-white flex items-center justify-center text-lg font-bold rounded shadow-sm">
                      {selectedBook.book_title ? selectedBook.book_title.substring(0, 2).toUpperCase() : 'BK'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedBook.book_title}</h3>
                      <p className="text-sm text-gray-500">{selectedBook.isbn}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-gray-500">Current Quantity:</div>
                    <div className="font-semibold">{selectedBook.curr_stock || 0}</div>
                    
                    <div className="text-gray-500">Minimum Quantity:</div>
                    <div>{selectedBook.min_stock || 50}</div>
                    
                    <div className="text-gray-500">Deficit:</div>
                    <div className="font-bold text-red-500">-{ (selectedBook.min_stock || 50) - (selectedBook.curr_stock || 0) }</div>
                    
                    <div className="text-gray-500">Vendor:</div>
                    <div>{selectedBook.vendor_name || "Unknown"}</div>
                    
                    <div className="text-gray-500">Rack:</div>
                    <div>{selectedBook.rack_location || "-"}</div>
                  </div>

                  <hr />

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Reorder Quantity:</label>
                      <input 
                        type="number" 
                        className="border rounded p-2 focus:ring-2 focus:ring-primary/50"
                        value={reorderForm.quantity}
                        onChange={(e) => setReorderForm({...reorderForm, quantity: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Reorder Date:</label>
                      <input 
                        type="date" 
                        className="border rounded p-2 focus:ring-2 focus:ring-primary/50"
                        value={reorderForm.date}
                        onChange={(e) => setReorderForm({...reorderForm, date: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Reorder Notes:</label>
                      <textarea 
                        placeholder="Enter notes here..." 
                        className="border rounded p-2 focus:ring-2 focus:ring-primary/50 h-20"
                        value={reorderForm.notes}
                        onChange={(e) => setReorderForm({...reorderForm, notes: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button variant="primary" className="w-full mt-2" onClick={handleReorderSubmit}>
                    Submit Reorder
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