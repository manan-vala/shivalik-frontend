import { CITIES } from "./clients.js";

/**
 * Sample vendor records.
 *
 * Transcribed from the GOLDEN file's Vendors screen (node 1180:48387) and its
 * dialogs. Replace with the Django API once the endpoint exists - VendorsPage,
 * VendorDetailDialog, VendorFormDialog and AssignStockDialog expect this shape.
 *
 * NOTES ON THE MOCKUP DATA
 *  - Every row in the Figma table carries the same id (VN-2001), the same
 *    "12K units" stock and the same "2" active orders. Same placeholder
 *    repetition as the Clients screen; ids are made unique here because
 *    duplicates break list keys and row identity.
 *  - The detail dialog shows "Sunrise Printing Works" (VN-2003, Delhi), which
 *    is not one of the table rows, and the Assign Stock dialog is titled for
 *    "Bharat Offset Printers", a third name again. Both are folded into the
 *    list below so every row has a consistent detail record behind it.
 */

const ORDER_SAMPLE = [
  { id: "ORD-5001", client: "Ritu Publications", status: "printing" },
  { id: "ORD-5002", client: "Ritu Publications", status: "printing" },
  { id: "ORD-4998", client: "Ritu Publications", status: "printing" },
];

const PAYMENT_SAMPLE = [
  { date: "05 Jun 2026", amount: "48,000", status: "paid" },
  { date: "05 Jun 2026", amount: "48,000", status: "paid" },
  { date: "05 Jun 2026", amount: "48,000", status: "paid" },
];

/**
 * The vendor's on-hand materials.
 *
 * Transcribed from the Assign Stock dialog's "Current Stock" panel
 * (node 1180:48145), which is the only place in the file that shows what a
 * vendor's stock actually consists of.
 */
const STOCK_SAMPLE = [
  { material: "Paper 70 GSM Maplitho", quantity: "12,500 sheets" },
  { material: "Printing Ink Black", quantity: "48 Litres" },
  { material: "Printing Ink CMYK Set", quantity: "8 Litres" },
];

function vendor(id, name, city, specialization, activeOrders, status, detail) {
  return {
    id,
    name,
    city,
    specialization,
    activeOrders,
    availableStock: "12K units",
    status,
    orders: ORDER_SAMPLE,
    payments: PAYMENT_SAMPLE,
    stock: STOCK_SAMPLE,
    ...detail,
  };
}

export const VENDORS = [
  vendor("VN-2001", "Mehta Book Deposit", "Mumbai", "printing", 1, "active", {
    contact: "Rakesh Mehta",
    phone: "+91 98100 22113",
    email: "rakesh@mehtabooks.in",
    registered: "01 Apr 2022",
  }),
  vendor("VN-2002", "Modi pustak Bhandar", "Gujarat", "binding", 2, "active", {
    contact: "Bhavesh Modi",
    phone: "+91 98100 22114",
    email: "bhavesh@modipustak.in",
    registered: "14 Jun 2022",
  }),
  vendor("VN-2003", "Sunrise Printing Works", "Delhi", "printing", 4, "inactive", {
    contact: "Anil Kumar",
    phone: "+91 98100 22113",
    email: "anil@sunriseprinting.in",
    registered: "01 Apr 2022",
  }),
  vendor("VN-2004", "Amit Book sellers", "Goa", "binding", 3, "active", {
    contact: "Amit Shah",
    phone: "+91 98100 22116",
    email: "amit@amitbooks.in",
    registered: "09 Sep 2022",
  }),
  vendor("VN-2005", "Gandhi ji pustak Ghar", "Gandhinagar", "printing", 2, "inactive", {
    contact: "Nikhil Gandhi",
    phone: "+91 98100 22117",
    email: "nikhil@gandhipustak.in",
    registered: "22 Nov 2022",
  }),
  vendor("VN-2006", "Savarkar & british sons", "Andaman", "printing", 1, "active", {
    contact: "Vinayak Savarkar",
    phone: "+91 98100 22118",
    email: "vinayak@savarkarsons.in",
    registered: "03 Feb 2023",
  }),
  vendor("VN-2007", "Bhagat Wholesales", "Mumbai", "binding", 2, "active", {
    contact: "Suresh Bhagat",
    phone: "+91 98100 22119",
    email: "suresh@bhagatwholesale.in",
    registered: "17 Mar 2023",
  }),
  vendor("VN-2008", "Bharat Offset Printers", "Pune", "printing", 2, "active", {
    contact: "Kiran Bharat",
    phone: "+91 98100 22120",
    email: "kiran@bharatoffset.in",
    registered: "28 Jul 2023",
  }),
];

/** Row status pill - green Active / red Inactive (node 1180:48558). */
export const VENDOR_STATUS = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "alert" },
};

/**
 * Specialization pill. Printing reads green and Binding reads blue in the
 * table (node 1180:48495) - these are two kinds of work rather than two
 * states, so they take the `success`/`info` tones for their colour only.
 */
export const SPECIALIZATION = {
  printing: { label: "Printing", tone: "success" },
  binding: { label: "Binding", tone: "info" },
};

/** Order status inside the detail dialog's Order tab (node 1180:48212). */
export const VENDOR_ORDER_STATUS = {
  printing: { label: "In Printing", tone: "info" },
  binding: { label: "In Binding", tone: "progress" },
  delivered: { label: "Delivered", tone: "success" },
};

/** Payment status inside the detail dialog's Payment tab (node 1180:48262). */
export const VENDOR_PAYMENT_STATUS = {
  paid: { label: "Paid", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
};

/** Options for the Assign Stock dialog's Material picker. */
export const MATERIALS = [
  "Paper 70 GSM Maplitho",
  "Paper 80 GSM Maplitho",
  "Printing Ink Black",
  "Printing Ink CMYK Set",
  "Binding Glue",
  "Cover Board",
];

/**
 * City options for the vendor form.
 *
 * Union of the client cities and the vendor ones - the vendors sit in cities
 * (Delhi, Pune) that no client does, and a select whose value is missing from
 * its own option list renders blank when Edit prefills it.
 */
export const VENDOR_CITIES = [
  ...new Set([...CITIES, ...VENDORS.map((v) => v.city)]),
].sort();

export const VENDOR_TYPES = ["Printing", "Binding"];

export const VENDOR_STATUS_OPTIONS = ["Active", "Inactive"];

/**
 * Chat thread shown in the vendor chat panel (node 1180:48315).
 *
 * `own` picks the bubble treatment: the signed-in user's messages are brand
 * filled and tailed at the top-right, the vendor's are white and tailed at the
 * top-left.
 */
export const CHAT_MESSAGES = [
  {
    id: 1,
    own: true,
    author: "You",
    time: "10 mins ago",
    body: "Hey Anita, I've had a read through and made some notes:",
    link: "https://docs.google.com/docu...",
  },
  {
    id: 2,
    own: false,
    author: "Anita Cruz",
    time: "Just now",
    body: "Thank you for the quick turnaround. Looking now.",
  },
  {
    id: 3,
    own: false,
    author: "Anita Cruz",
    typing: true,
  },
];
