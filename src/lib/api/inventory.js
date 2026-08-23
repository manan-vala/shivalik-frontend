import { apiClient } from "./client.js";

/**
 * Fetch all warehouse sections
 * Endpoint: GET /api/v1/inventory/sections/
 */
export async function getSections() {
  return apiClient("/inventory/sections/");
}

/**
 * Fetch all warehouse racks
 * Endpoint: GET /api/v1/inventory/racks/
 */
export async function getRacks() {
  return apiClient("/inventory/racks/");
}

/**
 * Fetch complete book inventory ledger records
 * Endpoint: GET /api/v1/inventory/books/inventory/
 */
export async function getBookInventory() {
  return apiClient("/inventory/books/inventory/");
}

/**
 * Fetch books in stock
 * Endpoint: GET /api/v1/inventory/stock/in-stock/
 */
export async function getInStockBooks() {
  return apiClient("/inventory/stock/in-stock/");
}
