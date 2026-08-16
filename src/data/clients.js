/**
 * Sample client records.
 *
 * List content is transcribed from the Figma Clients screen (node 790:56280);
 * the detail block on each record follows the shape of the client detail
 * dialog (nodes 790:56511 / 56474 / 56442). Replace with the Django API once
 * the endpoint exists - ClientsPage and ClientDetailDialog expect this shape.
 *
 * NOTES ON THE MOCKUP DATA
 *  - Every row in the Figma table carries the same id (VN-2001), date and
 *    outstanding amount. That is placeholder content, not a data model.
 *  - The detail dialog in Figma shows a different client entirely ("Ananya
 *    Arts", Delhi) than any row in the table, so the per-client detail below
 *    is filled in consistently rather than copied from that one frame.
 */

const ORDER_STATUS_SAMPLE = [
  { id: "ORD-5001", date: "10 Jun 2026", value: "Rs 43K", status: "printing" },
  { id: "ORD-5002", date: "02 Jun 2026", value: "Rs 43K", status: "printing" },
  { id: "ORD-4998", date: "24 May 2026", value: "Rs 61K", status: "binding" },
  { id: "ORD-4991", date: "11 May 2026", value: "Rs 28K", status: "delivered" },
];

const PAYMENT_SAMPLE = [
  { date: "05 Jun 2026", amount: "48,000", method: "UPI", status: "paid" },
  { date: "05 Jun 2026", amount: "48,000", method: "Cash", status: "paid" },
  { date: "05 Jun 2026", amount: "48,000", method: "NEFT", status: "paid" },
];

export const CLIENTS = [
  {
    id: "VN-2001",
    name: "Mehta Book Deposit",
    city: "Mumbai",
    lastOrder: "12 June 2026",
    outstanding: "12K",
    status: "active",
    contact: "Rakesh Mehta",
    phone: "+91 98100 22113",
    email: "rakesh@mehtabooks.in",
    customerId: "CT-2001",
    registered: "01 Apr 2022",
    orders: ORDER_STATUS_SAMPLE,
    payments: PAYMENT_SAMPLE,
  },
  {
    id: "VN-2002",
    name: "Modi pustak Bhandar",
    city: "Gujarat",
    lastOrder: "12 June 2026",
    outstanding: "12K",
    status: "active",
    contact: "Jayesh Modi",
    phone: "+91 98240 55192",
    email: "jayesh@modipustak.in",
    customerId: "CT-2002",
    registered: "18 Jul 2022",
    orders: ORDER_STATUS_SAMPLE.slice(0, 3),
    payments: PAYMENT_SAMPLE.slice(0, 2),
  },
  {
    id: "VN-2003",
    name: "Maloni Magazine House",
    city: "Italy",
    lastOrder: "12 June 2026",
    outstanding: "12K",
    status: "inactive",
    contact: "Giulia Maloni",
    phone: "+39 02 4567 8890",
    email: "giulia@malonimag.it",
    customerId: "CT-2003",
    registered: "09 Jan 2023",
    orders: ORDER_STATUS_SAMPLE.slice(0, 2),
    payments: [],
  },
  {
    id: "VN-2004",
    name: "Amit Book sellers",
    city: "Goa",
    lastOrder: "12 June 2026",
    outstanding: "12K",
    status: "active",
    contact: "Amit Naik",
    phone: "+91 90110 33421",
    email: "amit@amitbooks.in",
    customerId: "CT-2004",
    registered: "23 Mar 2023",
    orders: ORDER_STATUS_SAMPLE,
    payments: PAYMENT_SAMPLE,
  },
  {
    id: "VN-2005",
    name: "Gandhi ji pustak Ghar",
    city: "Gandhinagar",
    lastOrder: "12 June 2026",
    outstanding: "12K",
    status: "inactive",
    contact: "Harsh Gandhi",
    phone: "+91 99250 71180",
    email: "harsh@gandhipustak.in",
    customerId: "CT-2005",
    registered: "14 Nov 2021",
    orders: ORDER_STATUS_SAMPLE.slice(0, 1),
    payments: PAYMENT_SAMPLE.slice(0, 1),
  },
  {
    id: "VN-2006",
    name: "Savarkar & british sons",
    city: "Andaman",
    lastOrder: "12 June 2026",
    outstanding: "12K",
    status: "active",
    contact: "Vinay Savarkar",
    phone: "+91 3192 233 118",
    email: "vinay@savarkarsons.in",
    customerId: "CT-2006",
    registered: "05 Sep 2020",
    orders: ORDER_STATUS_SAMPLE.slice(0, 3),
    payments: PAYMENT_SAMPLE,
  },
];

/** Maps a client status to a Badge tone + label. */
export const CLIENT_STATUS = {
  active: { tone: "success", label: "Active" },
  inactive: { tone: "alert", label: "Inactive" },
};

/**
 * Order status vocabulary. "In Printing" is Blue light 50/700 in Figma, which
 * is the `info` role - so the tone names come straight from the token layer
 * rather than a per-screen colour decision.
 */
export const ORDER_STATUS = {
  printing: { tone: "info", label: "In Printing" },
  binding: { tone: "progress", label: "In Binding" },
  dispatch: { tone: "brand", label: "Ready for Dispatch" },
  delivered: { tone: "success", label: "Delivered" },
};

/** Payment status vocabulary. */
export const PAYMENT_STATUS = {
  paid: { tone: "success", label: "Paid" },
  pending: { tone: "warning", label: "Pending" },
  overdue: { tone: "error", label: "Overdue" },
};

/**
 * City options for the Add Client dialog. Derived from the rows above until a
 * real cities endpoint exists, so the dropdown is never empty in development.
 */
export const CITIES = [...new Set(CLIENTS.map((c) => c.city))].sort();
