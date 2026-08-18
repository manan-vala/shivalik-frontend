/**
 * Finance screen data.
 *
 * Transcribed from the Figma Finance screen (node 1180:35746). Replace with
 * the Django API; FinancePage and the payment dialogs expect these shapes.
 *
 * DATA QUALITY, transcribed faithfully rather than silently corrected (same
 * policy as data/clients.js):
 *   - Hachette India (ORD-0115) carries a non-zero Due amount but status
 *     "Paid" - contradictory in the source.
 *   - Manjul Academy (ORD-0165) is marked "Overdue" with Due shown as ₹0 -
 *     also contradictory.
 *   - "Penguin & Co" and "Penguin Press" both use order id ORD-0155.
 * None of these are fixed here; a real ledger would derive status from due
 * amount and date rather than storing both independently.
 */

export const PAYMENTS = [
  {
    id: "pay-1",
    client: "Aakash Interprices",
    orderId: "ORD-0105",
    value: 19879,
    due: 0,
    dueDate: "24 May 2026",
    paidOn: "29 May 2026",
    hasProof: false,
    status: "paid",
  },
  {
    id: "pay-2",
    client: "Penguin Academy",
    orderId: "ORD-0111",
    value: 13678,
    due: 0,
    dueDate: "04 May 2026",
    paidOn: "12 May 2026",
    hasProof: false,
    status: "paid",
  },
  {
    id: "pay-3",
    client: "Manjul Press",
    orderId: "ORD-0125",
    value: 11900,
    due: 11900,
    dueDate: "13 May 2026",
    paidOn: "29 May 2026",
    hasProof: false,
    status: "pending",
  },
  {
    id: "pay-4",
    client: "Bloomsbury India",
    orderId: "ORD-0129",
    value: 4879,
    due: 4879,
    dueDate: "20 June 2026",
    paidOn: "29 June 2026",
    hasProof: false,
    status: "overdue",
  },
  {
    id: "pay-5",
    client: "Penguin & Co",
    orderId: "ORD-0155",
    value: 28130,
    due: 28130,
    dueDate: "03 May 2026",
    paidOn: "24 May 2026",
    hasProof: true,
    status: "verifying",
    // Pre-filled onto the Verify dialog for this one row (node 1180:36066).
    paymentRef: "UPI-2406141023AXC",
    proofName: "File12345678",
    billNo: "43,500",
  },
  {
    id: "pay-6",
    client: "Bloomsbury Media",
    orderId: "ORD-0205",
    value: 21009,
    due: 0,
    dueDate: "13 June 2026",
    paidOn: "27 June 2026",
    hasProof: false,
    status: "pending",
  },
  {
    id: "pay-7",
    client: "Hachette India",
    orderId: "ORD-0115",
    value: 25800,
    due: 25800,
    dueDate: "09 June 2026",
    paidOn: "20 June 2026",
    hasProof: false,
    status: "paid",
  },
  {
    id: "pay-8",
    client: "Manjul Academy",
    orderId: "ORD-0165",
    value: 29079,
    due: 0,
    dueDate: "19 June 2026",
    paidOn: "26 June 2026",
    hasProof: false,
    status: "overdue",
  },
  {
    id: "pay-9",
    client: "Penguin Press",
    orderId: "ORD-0155",
    value: 18999,
    due: 18999,
    dueDate: "28 June 2026",
    paidOn: "07 July 2026",
    hasProof: false,
    status: "pending",
  },
];

/** Maps a payment status to a Badge tone + label. */
export const PAYMENT_STATUS = {
  paid: { tone: "success", label: "Paid" },
  pending: { tone: "warning", label: "Pending" },
  overdue: { tone: "error", label: "Overdue" },
  verifying: { tone: "warning", label: "Pending verification" },
};

/** Summary cards above the table. */
export const FINANCE_SUMMARY = [
  {
    label: "Collected this month",
    value: "₹2,52,400",
    caption: "3 payments",
    tone: "success",
  },
  {
    label: "Overdue",
    value: "₹1,10,000",
    caption: "2 invoices",
    tone: "error",
  },
  {
    label: "Pending Verification",
    value: "₹52,400",
    caption: "1 awaiting",
    tone: "warning",
  },
];
