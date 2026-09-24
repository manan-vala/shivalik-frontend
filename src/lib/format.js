/**
 * Display formatting for API values.
 *
 * Money arrives from Django as a decimal *string* ("600.00") — never a float
 * on the wire — and is only turned into a number here, for display.
 */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount) ? INR.format(amount) : "—";
}

/** "HA" for "Harry Potter…" — the stand-in for a cover image. */
export function coverInitials(title) {
  return title ? title.substring(0, 2).toUpperCase() : "BK";
}

/**
 * Stock status of a title from its total across racks.
 * Returns `{ label, tone }` for a <Badge>.
 */
export function stockStatus(total, minStock) {
  if (total <= 0) return { label: "Out of Stock", tone: "error" };
  if (total < minStock) return { label: "Low Stock", tone: "warning" };
  return { label: "In Stock", tone: "success" };
}
