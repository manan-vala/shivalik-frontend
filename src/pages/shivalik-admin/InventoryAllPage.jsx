import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";

export default function InventoryAllPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null); 

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const response = await fetch(`${API_BASE}/inventory/books/inventory/`);
        if (!response.ok) throw new Error("Failed to fetch all inventory");
        
        const data = await response.json();
        const booksArray = Array.isArray(data) ? data : (data.results || []);
        
        setBooks(booksArray);
      } catch (err) {
        console.error("Error fetching all inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBooks();
  }, []);

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="All Inventory" />
        <p className="text-sm text-gray-500 mt-1">Complete catalog of all book titles across every warehouse zone.</p>
      </div>

      <TableCard>
        <Table>
          <THead>
            <TR>
              <TH width={60}>Cover</TH>
              <TH width={250}>Book Name</TH>
              <TH width={120}>Stock</TH>
              <TH width={120}>Buy Price</TH>
              <TH width={120}>Sell Price</TH>
              <TH width={150}>Rack</TH>
              <TH width={100}>Status</TH>
              <TH width={100} align="right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR><TD colSpan={8} align="center" className="py-8 text-gray-500">Loading catalog...</TD></TR>
            ) : books.length === 0 ? (
              <TR><TD colSpan={8} align="center" className="py-8 text-gray-500">No books found.</TD></TR>
            ) : (
              books.map((book) => {
                const stock = book.curr_stock || 0;
                
                return (
                  <TR key={book.id}>
                    <TD>
                      <div className="w-8 h-8 rounded bg-[#1c2c4c] text-white flex items-center justify-center text-xs font-bold">
                        {book.book_title ? book.book_title.substring(0, 2).toUpperCase() : 'BK'}
                      </div>
                    </TD>
                    <TD>
                      <div className="font-medium text-gray-900">{book.book_title || "Unknown Title"}</div>
                      <div className="text-sm text-gray-500">{book.isbn}</div>
                    </TD>
                    <TD className="font-semibold">{stock}</TD>
                    {/* TODO (Backend): The /books/inventory/ ledger endpoint is missing 'buy_price' and 'sell_price'. 
                    Currently defaulting to 0. Remove the fallback once Team B adds them to BookStockActionsMixin. */}
                    <TD className="text-gray-600">₹{book.buy_price || book.mrp || 0}</TD>
                    <TD className="text-gray-600">₹{book.sell_price || book.mrp || 0}</TD>
                    <TD className="text-gray-600 truncate max-w-[150px]" title={book.rack_location || "Unassigned"}>
                      {book.rack_location || "-"}
                    </TD>
                    <TD>
                      <Badge tone={stock > 0 ? "success" : "critical"}>
                        {stock > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedBook(book)} className="text-gray-400 hover:text-primary">
                          {/* View Icon */}
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

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Book Details</h2>
                <p className="text-sm text-gray-500">Complete inventory information</p>
              </div>
              <button onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">
              <div className="flex gap-6 mb-8">
                <div className="w-24 h-32 bg-[#1c2c4c] text-white flex items-center justify-center text-3xl font-bold rounded-lg shadow-sm">
                  {selectedBook.book_title ? selectedBook.book_title.substring(0, 2).toUpperCase() : 'BK'}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBook.book_title || "Unknown Title"}</h3>
                  <p className="text-gray-500 mb-2">ISBN: {selectedBook.isbn}</p>
                  <Badge tone={(selectedBook.curr_stock || 0) > 0 ? "success" : "critical"}>
                    Current Stock: {selectedBook.curr_stock || 0}
                  </Badge>
                </div>
              </div>
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