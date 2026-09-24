import { apiClient, fetchAll } from "./client.js";

/**
 * Inventory API — `/api/v1/inventory/…`.
 *
 * List helpers return every row (`fetchAll` follows DRF's pages), so a screen
 * never silently stops at the first 25.
 */

// -- Locations ----------------------------------------------------------------

/** GET warehouses/ */
export function getWarehouses() {
  return fetchAll("/inventory/warehouses/");
}

/** GET sections/ */
export function getSections() {
  return fetchAll("/inventory/sections/");
}

/** GET racks/ */
export function getRacks() {
  return fetchAll("/inventory/racks/");
}

/** "Warehouse / Section / Rack" — the same label the ledger's `rack_location` uses. */
export function rackLabel(rack) {
  return `${rack.warehouse_name} / ${rack.section_name} / ${rack.name}`;
}

// -- Catalog ------------------------------------------------------------------

/** GET books/ — the catalog, stock not included. */
export function getBooks() {
  return fetchAll("/inventory/books/");
}

/** GET books/{id}/ */
export function getBook(id) {
  return apiClient(`/inventory/books/${id}/`);
}

/**
 * The catalog book with exactly this ISBN, or null.
 *
 * `?search=` is a case-insensitive *contains* match on title and ISBN, so
 * the exact match is picked out here.
 */
export async function findBookByIsbn(isbn) {
  const wanted = isbn.trim();
  const matches = await fetchAll("/inventory/books/", { params: { search: wanted } });
  return matches.find((book) => book.isbn === wanted) ?? null;
}

/** POST books/register/ — `{ title, isbn, mrp, … }` */
export function registerBook(book) {
  return apiClient("/inventory/books/register/", { body: book });
}

// -- Stock ledger ---------------------------------------------------------------

/**
 * GET books/inventory/ — one row per (book, rack): stock, vendor and the
 * "Warehouse / Section / Rack" label. A bare list, not paginated.
 */
export function getBookInventory() {
  return fetchAll("/inventory/books/inventory/");
}

/** GET stock/in-stock/ — books holding stock anywhere, totalled across racks. */
export function getInStockBooks() {
  return fetchAll("/inventory/stock/in-stock/");
}

/** GET stock/low-stock/ — books whose total stock is below `min_stock`. */
export function getLowStockBooks() {
  return fetchAll("/inventory/stock/low-stock/");
}

/** GET stock/low-selling/ — books flagged `low_selling` by sales analytics. */
export function getLowSellingBooks() {
  return fetchAll("/inventory/stock/low-selling/");
}

/** POST books/{id}/stock-in/ — `{ rack, vendor, quantity }` */
export function stockIn(bookId, { rack, vendor, quantity }) {
  return apiClient(`/inventory/books/${bookId}/stock-in/`, {
    body: { rack, vendor, quantity },
  });
}

/** POST books/{id}/stock-out/ — `{ rack, vendor, quantity }` */
export function stockOut(bookId, { rack, vendor, quantity }) {
  return apiClient(`/inventory/books/${bookId}/stock-out/`, {
    body: { rack, vendor, quantity },
  });
}

/**
 * POST books/{id}/run-campaign/
 *
 * The backend route is a published stub (open question Q13): it checks the
 * book is flagged low-selling and acknowledges. The campaign terms are sent
 * so the contract is in place when a real runner lands.
 */
export function runCampaign(bookId, terms) {
  return apiClient(`/inventory/books/${bookId}/run-campaign/`, { body: terms });
}

/**
 * Per-book stock totals from the ledger: `Map<bookId, { total, racks, vendors }>`.
 *
 * `racks` — `[{ rack, rack_location, curr_stock, vendor, vendor_name }]`,
 *   only racks that hold the book *now*. A ledger row outlives its stock
 *   (a fully booked-out rack keeps its row at 0), so an unfiltered list
 *   would place an out-of-stock title on racks it has left.
 * `vendors` — `Map<vendorId, name>` of everyone who has supplied the book,
 *   including onto racks since emptied.
 */
export function totalsByBook(ledgerRows) {
  const totals = new Map();
  for (const row of ledgerRows) {
    const entry = totals.get(row.book) ?? { total: 0, racks: [], vendors: new Map() };
    entry.total += row.curr_stock;
    if (row.curr_stock > 0) {
      entry.racks.push({
        rack: row.rack,
        rack_location: row.rack_location,
        curr_stock: row.curr_stock,
        vendor: row.vendor,
        vendor_name: row.vendor_name,
      });
    }
    if (row.vendor) entry.vendors.set(row.vendor, row.vendor_name);
    totals.set(row.book, entry);
  }
  return totals;
}

// -- Vendors & purchase orders ------------------------------------------------

/** GET vendors/active/ — vendors that are not blocked. */
export function getActiveVendors() {
  return fetchAll("/inventory/vendors/active/");
}

/** POST purchase-orders/ */
export function createPurchaseOrder(order) {
  return apiClient("/inventory/purchase-orders/", { body: order });
}
