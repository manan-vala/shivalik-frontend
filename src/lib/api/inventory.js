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

/** POST warehouses/ — `{ name, code, location, description, is_active }` */
export function createWarehouse(warehouse) {
  return apiClient("/inventory/warehouses/", { body: warehouse });
}

/**
 * PATCH warehouses/{id}/
 *
 * The model's own guidance is "deactivate rather than delete" — racks and
 * ledger rows hang off a warehouse and must not be orphaned — so this is the
 * only write path offered for an existing warehouse; there is no
 * `deleteWarehouse`. Toggling `is_active` off is how one is retired.
 */
export function updateWarehouse(id, warehouse) {
  return apiClient(`/inventory/warehouses/${id}/`, { method: "PATCH", body: warehouse });
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

/**
 * GET stock/dead-stock/ — ledger rows holding stock that has not moved out
 * for longer than the title's dead-stock window. Computed on read; the
 * newest-stale row first.
 */
export function getDeadStock() {
  return fetchAll("/inventory/stock/dead-stock/");
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

// -- Vendors --------------------------------------------------------------------

/** GET vendors/ — every vendor, blocked or not. */
export function getVendors() {
  return fetchAll("/inventory/vendors/");
}

/** GET vendors/active/ — vendors that are not blocked. */
export function getActiveVendors() {
  return fetchAll("/inventory/vendors/active/");
}

/**
 * POST vendors/ — `{ company_name, vendor_name, gst_number, contact_person,
 * phone, email, address, categories_supplied, expected_delivery_days,
 * payment_terms, notes }`. `is_blocked` is read-only here; see
 * `blockVendor`/`unblockVendor`.
 */
export function createVendor(vendor) {
  return apiClient("/inventory/vendors/", { body: vendor });
}

/** PATCH vendors/{id}/ — same fields as `createVendor`. */
export function updateVendor(id, vendor) {
  return apiClient(`/inventory/vendors/${id}/`, { method: "PATCH", body: vendor });
}

/** PATCH vendors/{id}/block/ — admin only once role enforcement is on. */
export function blockVendor(id) {
  return apiClient(`/inventory/vendors/${id}/block/`, { method: "PATCH", body: {} });
}

/** PATCH vendors/{id}/unblock/ */
export function unblockVendor(id) {
  return apiClient(`/inventory/vendors/${id}/unblock/`, { method: "PATCH", body: {} });
}

/** GET vendors/{id}/purchase_orders/ — this vendor's purchase orders. */
export function getVendorPurchaseOrders(id) {
  return fetchAll(`/inventory/vendors/${id}/purchase_orders/`);
}

// -- Purchase orders --------------------------------------------------------------

/** GET purchase-orders/, optionally `{ vendor, status }` filtered. */
export function getPurchaseOrders(params) {
  return fetchAll("/inventory/purchase-orders/", { params });
}

/** GET purchase-orders/{id}/ */
export function getPurchaseOrder(id) {
  return apiClient(`/inventory/purchase-orders/${id}/`);
}

/**
 * POST purchase-orders/ — `{ vendor, status?, order_date?,
 * expected_delivery_date?, notes?, lines: [{ book, quantity_ordered,
 * unit_price }] }`. `status` defaults to DRAFT; PLACED is also accepted.
 */
export function createPurchaseOrder(order) {
  return apiClient("/inventory/purchase-orders/", { body: order });
}

/**
 * PATCH purchase-orders/{id}/ — same shape as create. Replaces `lines`
 * wholesale when sent. The backend only allows this while the order is
 * DRAFT or PLACED, and refuses setting `status` to DISPATCHED or RECEIVED
 * here — use `dispatchPurchaseOrder`/`receivePurchaseOrder` for those.
 */
export function updatePurchaseOrder(id, order) {
  return apiClient(`/inventory/purchase-orders/${id}/`, { method: "PATCH", body: order });
}

/** PATCH purchase-orders/{id}/ — convenience for the DRAFT/PLACED -> CANCELLED transition. */
export function cancelPurchaseOrder(id) {
  return updatePurchaseOrder(id, { status: "CANCELLED" });
}

/** PATCH purchase-orders/{id}/dispatch/ — DRAFT or PLACED -> DISPATCHED. */
export function dispatchPurchaseOrder(id) {
  return apiClient(`/inventory/purchase-orders/${id}/dispatch/`, { method: "PATCH", body: {} });
}

/**
 * PATCH purchase-orders/{id}/receive/ — `{ lines: [{ line_id,
 * quantity_received, rack_id }] }`. One transaction: if any line is
 * rejected, nothing is booked in. The order becomes RECEIVED once every
 * line is fully received; a partial receipt leaves it DISPATCHED.
 */
export function receivePurchaseOrder(id, lines) {
  return apiClient(`/inventory/purchase-orders/${id}/receive/`, {
    method: "PATCH",
    body: { lines },
  });
}
