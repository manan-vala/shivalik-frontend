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
import Badge from "../../components/ui/Badge.jsx"; 

export default function InventoryInStockPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Hitting the joined ledger endpoint instead of just the catalog
        const response = await fetch(`${API_BASE}/inventory/books/inventory/`);
        if (!response.ok) throw new Error("Failed to fetch books");
        
        const data = await response.json();
        
        // Handles both DRF paginated objects and raw arrays safely
        const booksArray = Array.isArray(data) ? data : (data.results || []);
        
        console.log("Safely parsed book data:", booksArray);
        setBooks(booksArray);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Could not load book data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Calculate only the items actually in stock for the top dashboard badge
  const inStockCount = books.filter(b => (b.curr_stock || 0) > 0).length;

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">In Stock</h1>
        <p className="text-sm text-gray-500 mt-1">Titles with available quantity above minimum threshold.</p>
      </div>

      {/* Alert Card from Mockup */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Healthy Stock Levels</h3>
            <p className="text-sm text-green-700">All items below are above minimum threshold and ready for fulfillment</p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-3xl font-bold text-green-600">{inStockCount}</span>
          <span className="text-sm text-green-700">Titles in stock</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md mx-auto w-full">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search in-stock items..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        {error ? (
          <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">{error}</div>
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
                  <TH width={150}>Zone</TH>
                  <TH width={120}>Last Updated</TH>
                  <TH width={100} align="right">Status</TH>
                </TR>
              </THead>
              <TBody>
                {loading ? (
                  <TR>
                    <TD colSpan={8} align="center" className="text-gray-500 py-8">
                      Loading stock levels...
                    </TD>
                  </TR>
                ) : books.length === 0 ? (
                  <TR>
                    <TD colSpan={8} align="center" className="text-gray-500 py-8">
                      No books found.
                    </TD>
                  </TR>
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
                          <div className="text-sm text-gray-500">{book.author || "Unknown Author"}</div>
                        </TD>
                        <TD className="text-gray-600">{book.isbn}</TD>
                        <TD className="font-semibold text-green-600">{stock}</TD>
                        <TD className="text-gray-600">{book.reorder_level || 50}</TD>
                        {/* Truncating Zone name to fit cleanly, adding hover title */}
                        <TD className="text-gray-600 truncate max-w-[150px]" title={book.rack_location || "Unassigned"}>
                          {book.rack_location || "Unassigned"}
                        </TD>
                        <TD className="text-gray-600">
                          {book.updated_at ? new Date(book.updated_at).toLocaleDateString() : "-"}
                        </TD>
                        <TD>
                          <div className="flex justify-end">
                            <Badge tone={stock > 0 ? "success" : "critical"}>
                              {stock > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
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