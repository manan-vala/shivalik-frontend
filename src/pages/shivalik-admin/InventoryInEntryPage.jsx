import { useState, useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../../components/ui/Table.jsx";
import Button from "../../components/ui/Button.jsx";

export default function InventoryInEntryPage() {
  // 1. Vendor Form State
  const [vendorData, setVendorData] = useState({
    name: "",
    invoice: "",
    date: "",
    challan: "",
    notes: ""
  });

  // 2. Dynamic Line Items State (Now includes 'title')
  const [lineItems, setLineItems] = useState([
    { id: 1, title: "", isbn: "", category: "", qty: 0, mrp: 0, buyPrice: 0, sellPrice: 0 }
  ]);

  // Add a new empty row
  const addRow = () => {
    setLineItems([
      ...lineItems, 
      { id: Date.now(), title: "", isbn: "", category: "", qty: 0, mrp: 0, buyPrice: 0, sellPrice: 0 }
    ]);
  };

  // Remove a row (ensure at least 1 remains)
  const removeRow = (idToRemove) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== idToRemove));
    }
  };

  // Update a specific field in a specific row
  const updateRow = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // 3. Auto-calculated Summary Math
  const summary = useMemo(() => {
    let totalQty = 0;
    let totalPurchaseValue = 0;
    let totalSellingValue = 0;

    lineItems.forEach(item => {
      const q = Number(item.qty) || 0;
      const bp = Number(item.buyPrice) || 0;
      const sp = Number(item.sellPrice) || 0;

      totalQty += q;
      totalPurchaseValue += (q * bp);
      totalSellingValue += (q * sp);
    });

    const expectedMargin = totalSellingValue > 0 
      ? (((totalSellingValue - totalPurchaseValue) / totalSellingValue) * 100).toFixed(1)
      : 0.0;

    return { totalQty, totalPurchaseValue, totalSellingValue, expectedMargin };
  }, [lineItems]);

  // 4. Submit Data to Django
  const handleSubmit = async () => {
    if (lineItems.length === 0 || !lineItems[0].isbn || !lineItems[0].title) {
      alert("Please add at least one valid book with a Title and ISBN.");
      return;
    }

    try {
      const submitPromises = lineItems.map(async (item) => {
        // STEP 1: Register the Book Profile
        const bookPayload = {
          title: item.title, 
          isbn: item.isbn,
          mrp: Number(item.mrp),
          buy_price: Number(item.buyPrice),
          sell_price: Number(item.sellPrice)
        };

        const bookResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'}/inventory/books/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookPayload),
        });

        if (!bookResponse.ok) {
          throw new Error(JSON.stringify(await bookResponse.json()));
        }
        
        const createdBook = await bookResponse.json();

        // STEP 2: Record the Stock-In Transaction
        if (Number(item.qty) > 0) {
          const stockPayload = {
            quantity: Number(item.qty),
            notes: `Received from ${vendorData.name}`,
            rack: 1,   // <-- Added default Rack ID
            vendor: 1  // <-- Added default Vendor ID
          };
          
          const stockResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'}/inventory/books/${createdBook.id}/stock-in/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stockPayload),
          });
          // --- NEW: CATCH EXACT STOCK-IN ERROR ---
          if (!stockResponse.ok) {
            const stockError = await stockResponse.json();
            console.error(`Stock-in failed for ${item.title}:`, stockError);
            throw new Error(`Stock-in rejected: ${JSON.stringify(stockError)}`);
          }
        }
        
        return createdBook;
      });

      await Promise.all(submitPromises);

      alert("Inventory successfully added and stocked!");
      setVendorData({ name: "", invoice: "", date: "", challan: "", notes: "" });
      setLineItems([{ id: 1, title: "", isbn: "", category: "", qty: 0, mrp: 0, buyPrice: 0, sellPrice: 0 }]);
      
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Backend Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <div>
        <PageHeader title="IN Entry" />
        <p className="text-sm text-gray-500 mt-1">Record incoming stock received from vendors.</p>
      </div>

      {/* Vendor Information Card */}
      <Card title="Vendor Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Vendor Name *</label>
            <input 
              type="text" 
              placeholder="Search vendors..." 
              className="border rounded p-2 focus:ring-2 focus:ring-primary/50" 
              value={vendorData.name}
              onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Vendor Invoice Number *</label>
            <input 
              type="text" 
              placeholder="e.g., INV-2026-001234" 
              className="border rounded p-2 focus:ring-2 focus:ring-primary/50"
              value={vendorData.invoice}
              onChange={(e) => setVendorData({...vendorData, invoice: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Delivery Date *</label>
            <input 
              type="date" 
              className="border rounded p-2 focus:ring-2 focus:ring-primary/50"
              value={vendorData.date}
              onChange={(e) => setVendorData({...vendorData, date: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Delivery Challan Number</label>
            <input 
              type="text" 
              placeholder="e.g., DC-2026-5678" 
              className="border rounded p-2 focus:ring-2 focus:ring-primary/50"
              value={vendorData.challan}
              onChange={(e) => setVendorData({...vendorData, challan: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Purchase Notes</label>
            <textarea 
              placeholder="Optional notes about this purchase..." 
              className="border rounded p-2 focus:ring-2 focus:ring-primary/50 h-24"
              value={vendorData.notes}
              onChange={(e) => setVendorData({...vendorData, notes: e.target.value})}
            />
          </div>
        </div>
      </Card>

      {/* Books Received Dynamic Table */}
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
                  <TH width={200}>Book Name</TH>
                  <TH width={150}>ISBN</TH>
                  <TH width={100}>Qty</TH>
                  <TH width={120}>MRP</TH>
                  <TH width={120}>Buy Price</TH>
                  <TH width={120}>Sell Price</TH>
                  <TH width={100}>Margin%</TH>
                  <TH width={60} align="center">Action</TH>
                </TR>
              </THead>
              <TBody>
                {lineItems.map((item) => {
                  const margin = item.sellPrice > 0 
                    ? (((item.sellPrice - item.buyPrice) / item.sellPrice) * 100).toFixed(1) 
                    : "0.0";
                  
                  return (
                    <TR key={item.id}>
                      <TD>
                        <div className="w-8 h-8 rounded bg-[#1c2c4c] text-white flex items-center justify-center text-xs font-bold">
                          {item.title ? item.title.substring(0, 2).toUpperCase() : '?'}
                        </div>
                      </TD>
                      <TD>
                        <input type="text" placeholder="Title..." className="w-full border rounded p-1" value={item.title} onChange={(e) => updateRow(item.id, "title", e.target.value)} />
                      </TD>
                      <TD>
                        <input type="text" placeholder="ISBN" className="w-full border rounded p-1" value={item.isbn} onChange={(e) => updateRow(item.id, "isbn", e.target.value)} />
                      </TD>
                      <TD>
                        <input type="number" min="0" className="w-full border rounded p-1" value={item.qty} onChange={(e) => updateRow(item.id, "qty", e.target.value)} />
                      </TD>
                      <TD>
                        <input type="number" min="0" className="w-full border rounded p-1" value={item.mrp} onChange={(e) => updateRow(item.id, "mrp", e.target.value)} />
                      </TD>
                      <TD>
                        <input type="number" min="0" className="w-full border rounded p-1 bg-blue-50" value={item.buyPrice} onChange={(e) => updateRow(item.id, "buyPrice", e.target.value)} />
                      </TD>
                      <TD>
                        <input type="number" min="0" className="w-full border rounded p-1 bg-blue-50" value={item.sellPrice} onChange={(e) => updateRow(item.id, "sellPrice", e.target.value)} />
                      </TD>
                      <TD>
                        <span className={`font-medium ${margin < 0 ? 'text-red-500' : 'text-green-600'}`}>{margin}%</span>
                      </TD>
                      <TD align="center">
                        <button onClick={() => removeRow(item.id)} className="text-red-500 hover:text-red-700 font-bold p-2">✕</button>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          </TableCard>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="border bg-white rounded-lg p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Total Books</span>
          <span className="text-3xl font-bold">{lineItems.length}</span>
          <span className="text-xs text-gray-400">{summary.totalQty} total units</span>
        </div>
        <div className="border bg-white rounded-lg p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Purchase Value</span>
          <span className="text-3xl font-bold">₹{summary.totalPurchaseValue.toLocaleString()}</span>
          <span className="text-xs text-gray-400">Total cost</span>
        </div>
        <div className="border bg-white rounded-lg p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Selling Value</span>
          <span className="text-3xl font-bold">₹{summary.totalSellingValue.toLocaleString()}</span>
          <span className="text-xs text-gray-400">Potential revenue</span>
        </div>
        <div className="border bg-white rounded-lg p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500 font-medium">Expected Margin</span>
          <span className="text-3xl font-bold text-red-500">{summary.expectedMargin}%</span>
          <span className="text-xs text-gray-400">Profit margin</span>
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-8">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add To Inventory</Button>
      </div>
    </div>
  );
}