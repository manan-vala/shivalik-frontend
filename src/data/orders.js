/**
 * Sample order records.
 *
 * Transcribed from the GOLDEN file's Orders screens (nodes 1180:51161,
 * 50810, 50943, 51000, 51057). Replace with the Django API once the endpoint
 * exists - OrdersPage and OrderDetailDialog expect this shape.
 *
 * NOTES ON THE MOCKUP DATA
 *  - Every row in the Figma table carries the same value (Rs 68,000) and the
 *    client names are the Clients screen's rows reused. Kept as drawn; only
 *    the order ids are already unique in the source.
 *  - The detail frames all show ORD-5002 while the list runs ORD-10000
 *    upward, so the detail record is attached to a list row rather than kept
 *    as a separate orphan id.
 *
 * STATUS COLOURS were sampled from the rendered frame rather than guessed:
 *   Ready For Dispatch / Dispatched  #ECFDF3  success-50  -> success
 *   In Design / In Printing          #EEF4FF  indigo-50   -> progress
 *   In Binding                       #FFF6ED  orange-50   -> alert
 *   Delivered                        #F2F4F7  gray-100    -> neutral
 *   Partial Paid                     #F0F9FF  bluelight-50-> info
 *   Pending Verification             #FFFAEB  warning-50  -> warning
 *
 * This disagrees with `ORDER_STATUS` in data/clients.js, where the client
 * detail dialog colours "In Printing" bluelight and "In Binding" indigo. The
 * two frames genuinely paint the same labels differently; this vocabulary is
 * the Orders screen's own and is kept separate rather than one being bent to
 * match the other.
 */

/** Order stage. Keys are the route segments the sidebar filters by. */
export const ORDER_STATUS = {
  design: { label: "In Design", tone: "progress" },
  printing: { label: "In Printing", tone: "progress" },
  binding: { label: "In Binding", tone: "alert" },
  "ready-for-dispatch": { label: "Ready For Dispatch", tone: "success" },
  dispatched: { label: "Dispatched", tone: "success" },
  delivered: { label: "Delivered", tone: "neutral" },
};

/** Payment state shown beside the stage in the list. */
export const ORDER_PAYMENT_STATUS = {
  paid: { label: "Paid", tone: "success" },
  partial: { label: "Partial Paid", tone: "info" },
  verifying: { label: "Pending Verification", tone: "warning" },
  left: { label: "Left", tone: "error" },
};

/** Stage options for the detail dialog's "Change status" picker. */
export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS).map(
  (s) => s.label
);

/** Courier options for the Confirm Dispatch dialog (node 1180:51138). */
export const COURIERS = [
  "Blue Dart",
  "DTDC",
  "Delhivery",
  "Gati",
  "India Post",
  "Own Transport",
];

/**
 * The detail record behind a row - parties, line items, timeline and money.
 * Transcribed from the Overview frame (node 1180:50810).
 */
const DETAIL_SAMPLE = {
  placed: "Placed 11 Jun, 09:56 am",
  parties: {
    client: {
      role: "Client",
      name: "Aakash Enterprise",
      meta: "Delhi . +91 XXXXX XXXXX",
    },
    printing: { role: "Printing", name: "Krishna Digital Press" },
    binding: { role: "Binding", name: "Sharma Binding Works" },
  },
  lineItems: [
    { item: "Annual Reason 2025", qty: 500, unit: 180, total: 90000 },
  ],
  /**
   * `state` drives the treatment: done steps show their timestamp, `current`
   * is the orange one the frame highlights, `pending` is greyed with no date.
   */
  timeline: [
    { step: "Quote Sent", at: "08 June, 09:56 am", state: "done" },
    { step: "Order Confirmed", at: "09 June, 09:56 am", state: "done" },
    { step: "Design", at: "10 June, 09:56 am", state: "done" },
    { step: "Printing", at: "11 June, 09:56 am", state: "done" },
    { step: "Binding", at: "12 June, 09:56 am", state: "done" },
    { step: "Dispatch", state: "current" },
    { step: "Delivered", state: "pending" },
  ],
  money: { due: 90000, paid: 90000, balance: 90000 },
  deliveryAddress: "Aakash Enterprise, Delhi, 40001",
};

function order(id, client, city, items, status, payment, extra = {}) {
  return {
    id,
    client,
    city,
    items,
    value: 68000,
    status,
    payment,
    ...DETAIL_SAMPLE,
    ...extra,
  };
}

export const ORDERS = [
  order("ORD-10000", "Mehta Book Deposit", "Mumbai", 1, "ready-for-dispatch", "paid"),
  order("ORD-10001", "Modi pustak Bhandar", "Gujarat", 2, "printing", "partial"),
  order("ORD-10002", "Maloni Magazine House", "Italy", 4, "binding", "verifying"),
  order("ORD-10003", "Amit Book sellers", "Goa", 3, "design", "left"),
  order("ORD-10004", "Gandhi ji pustak Ghar", "Gandhinagar", 2, "binding", "verifying"),
  order("ORD-10005", "Savarkar & british sons", "Andaman", 1, "delivered", "paid"),
  order("ORD-10006", "Bhagat Wholesales", "Mumbai", 2, "dispatched", "partial"),
];

/** The three metric cards above the table (node 1180:51161). */
export const ORDER_SUMMARY = [
  { label: "Quotes Pending", value: "5" },
  { label: "Active Orders", value: "7" },
  { label: "Ready for Dispatch", value: "2" },
];

/**
 * Chat thread shown on the Client / Printing Vendor / Binding Vendor tabs.
 *
 * The same three messages are drawn on all three tabs in the file, so one
 * thread serves them here; swap for a per-party fetch when the API exists.
 */
export { CHAT_MESSAGES } from "./vendors.js";
