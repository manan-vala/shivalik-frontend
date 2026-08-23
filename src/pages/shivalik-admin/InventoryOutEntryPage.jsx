import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Button from "../../components/ui/Button.jsx";

export default function InventoryOutEntryPage() {
  // Generate a random Reference Number on component mount (like TRF-517819)
  const [refNumber, setRefNumber] = useState("");
  
  useEffect(() => {
    setRefNumber(`TRF-${Math.floor(Math.random() * 900000) + 100000}`);
  }, []);

  const [transferDetails, setTransferDetails] = useState({
    type: "",
    destination: "",
    date: "",
    employee: ""
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]); // Holds books added to the transfer

  // TODO (Backend): Need the exact API endpoint for Manual OUT Transfers.
// Awaiting Team B to confirm if we POST to /inventory/stock-out/ or a new /transfers/ endpoint.
  const handleTransferSubmit = async () => {
    if (selectedBooks.length === 0) {
      alert("Please add at least one book to transfer.");
      return;
    }
    
    // In a real app, POST to /api/v1/inventory/stock-out/ or /transfers/
    console.log("Submitting OUT Transfer:", {
      reference: refNumber,
      ...transferDetails,
      books: selectedBooks
    });
    
    alert(`Transfer ${refNumber} successfully created!`);
    
    // Reset form
    setSelectedBooks([]);
    setTransferDetails({ type: "", destination: "", date: "", employee: "" });
    setRefNumber(`TRF-${Math.floor(Math.random() * 900000) + 100000}`);
  };

  // Mock function to simulate adding a book from search
  const handleSimulateSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      const newBook = {
        id: Date.now(),
        title: searchQuery,
        isbn: `978-${Math.floor(Math.random() * 900000000)}`,
        transferQty: 1
      };
      setSelectedBooks([...selectedBooks, newBook]);
      setSearchQuery(""); // clear search
    }
  };

  const removeBook = (id) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== id));
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8 relative">
      <div>
        <PageHeader title="Manual Transfer (OUT)" />
        <p className="text-sm text-gray-500 mt-1">Manually transfer books to another warehouse or inventory location.</p>
      </div>

      {/* TRANSFER DETAILS CARD */}
      <Card>
        <div className="p-6">
          <h3 className="text-base font-bold text-gray-900 mb-6">Transfer Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Transfer Type</label>
              <select 
                className="border rounded-md p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/50 text-gray-700"
                value={transferDetails.type}
                onChange={(e) => setTransferDetails({...transferDetails, type: e.target.value})}
              >
                <option value="">Select transfer type...</option>
                <option value="warehouse">Warehouse to Warehouse</option>
                <option value="store">Warehouse to Retail Store</option>
                <option value="damage">Damage / Write-off</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Destination Inventory</label>
              <select 
                className="border rounded-md p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/50 text-gray-700"
                value={transferDetails.destination}
                onChange={(e) => setTransferDetails({...transferDetails, destination: e.target.value})}
              >
                <option value="">Select destination...</option>
                <option value="south-city">South City Reserve</option>
                <option value="east-wing">East Wing Annex</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Reference Number</label>
              <input 
                type="text" 
                className="border rounded-md p-2.5 bg-gray-100 text-gray-600 cursor-not-allowed" 
                value={refNumber}
                readOnly
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Transfer Date</label>
              <input 
                type="date" 
                className="border rounded-md p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/50 text-gray-700"
                value={transferDetails.date}
                onChange={(e) => setTransferDetails({...transferDetails, date: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Responsible Employee</label>
              <input 
                type="text" 
                placeholder="Search staff members..." 
                className="border rounded-md p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/50 text-gray-700"
                value={transferDetails.employee}
                onChange={(e) => setTransferDetails({...transferDetails, employee: e.target.value})}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* BOOKS TO TRANSFER CARD */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900">Books to Transfer</h3>
            
            {/* Search Bar matching mockup */}
            <div className="relative w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Search and add book..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-md focus:bg-white focus:ring-2 focus:ring-primary/50 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSimulateSearch}
              />
            </div>
          </div>

          {/* EMPTY STATE OR TABLE */}
          {selectedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-1">No books added yet</h4>
              <p className="text-sm text-gray-500">Search above to add books to this transfer</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <THead>
                  <TR>
                    <TH width={300}>Book Title</TH>
                    <TH width={200}>ISBN</TH>
                    <TH width={150}>Transfer Qty</TH>
                    <TH width={80} align="center">Action</TH>
                  </TR>
                </THead>
                <TBody>
                  {selectedBooks.map(book => (
                    <TR key={book.id}>
                      <TD className="font-medium text-gray-900">{book.title}</TD>
                      <TD className="text-gray-500">{book.isbn}</TD>
                      <TD>
                        <input 
                          type="number" 
                          min="1" 
                          className="w-24 border rounded p-1" 
                          value={book.transferQty} 
                          onChange={(e) => {
                            setSelectedBooks(selectedBooks.map(b => b.id === book.id ? {...b, transferQty: e.target.value} : b))
                          }}
                        />
                      </TD>
                      <TD align="center">
                        <button onClick={() => removeBook(book.id)} className="text-red-500 hover:text-red-700 p-2">✕</button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4 pb-8">
        <Button variant="secondary" className="px-6 !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !border-gray-200">
          Cancel
        </Button>
        <Button variant="primary" className="px-6 !bg-slate-400 hover:!bg-slate-500 flex gap-2 items-center" onClick={handleTransferSubmit}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          Complete Transfer
        </Button>
      </div>
    </div>
  );
}