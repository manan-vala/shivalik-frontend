/**
 * Shivalik Admin dashboard data.
 *
 * Transcribed from the Figma Dashboard screen (node 790:22313). Replace with
 * the Django API; DashboardPage expects these shapes.
 */

/** Top KPI row. `delta` renders a trend pill; `direction` picks its tone. */
export const KPIS = [
  { label: "Active Orders", value: "34", delta: "10%", direction: "up" },
  { label: "Revenue this month", value: "Rs 8.4L", delta: "12%", direction: "up" },
  { label: "Pending Dispatch", value: "7", delta: "12%", direction: "up" },
  { label: "Collection rate", value: "82%", delta: "2%", direction: "down" },
];

/**
 * Revenue trend, two series over twelve months.
 *
 * The Figma chart draws two unlabelled lines and no legend, so what the second
 * series measures is not recorded anywhere in the file. "Collections" is an
 * assumption drawn from the Collection rate KPI on the same screen - confirm
 * before this reaches anyone who will read the numbers.
 */
export const REVENUE_TREND = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  series: [
    {
      id: "revenue",
      label: "Revenue",
      // Lakhs of rupees.
      values: [4.1, 4.0, 4.3, 4.2, 5.1, 5.6, 6.4, 6.1, 6.8, 7.2, 7.9, 8.4],
    },
    {
      id: "collections",
      label: "Collections",
      values: [3.2, 3.1, 3.4, 3.0, 3.9, 4.2, 4.6, 4.4, 4.9, 5.1, 5.4, 5.8],
    },
  ],
  unit: "L",
  prefix: "Rs ",
};

/** Live activity feed. `link` is the highlighted party. */
export const LIVE_ACTIVITY = [
  { title: "New Order Received", detail: "Hindi textbook-2000", link: "Ritu Publications" },
  { title: "Payment Received", detail: "Rs 18,000 vis UPI", link: "Suresh Enterprises" },
  { title: "Quote received", detail: "Novel- Whispers of Bombay", link: "Priya Sharma" },
  { title: "Vendor ready for dispatch", detail: "", link: "Bharat offset distributors" },
];

export const STAFF_OVERVIEW = [
  { label: "TOTAL STAFF", value: "7" },
  { label: "PRESENT TODAY", value: "5" },
  { label: "ABSENT TODAY", value: "2" },
  { label: "TODAY'S RATE", value: "71%" },
];

export const MONTHLY_ATTENDANCE = {
  title: "Monthly Attendance- June 2026",
  stats: [
    { label: "TOTAL MAN DAYS", value: "17/30" },
    { label: "PERFECT ATTENDANCE", value: "1" },
    { label: "BELOW 15 DAYS", value: "7" },
    { label: "AVG EMPLOYEE", value: "10 days" },
  ],
};

/** Attendance states offered in each request row's dropdown. */
export const ATTENDANCE_STATES = ["Present", "Late", "Half day", "Absent"];

export const ATTENDANCE_REQUESTS = [
  { id: "att-1", name: "Sneha Kulkarni", state: "Present" },
  { id: "att-2", name: "Deepak Nair", state: "Late" },
  { id: "att-3", name: "Rahul gupta", state: "Half day" },
  { id: "att-4", name: "Mahak Gupta", state: "Present" },
  { id: "att-5", name: "Sushant Jangid", state: "Half day" },
];

/** Options for the Create Quote dialog. */
export const QUOTE_OPTIONS = {
  paperTypes: ["Maplitho", "Art Paper", "Newsprint", "Bond"],
  gsm: ["70", "80", "90", "100", "130"],
  printing: ["B&W", "Colour", "Mixed"],
  binding: ["Perfect", "Saddle Stitch", "Hardcase", "Spiral"],
  finishing: ["Lamination Matte", "Lamination Gloss", "UV Coating", "None"],
  titles: ["Job name", "Hindi Textbook Class 8", "Whispers of Bombay", "Neet Guide"],
};

/** Cost breakdown shown in the Create Quote dialog. */
export const QUOTE_COSTS = {
  lines: [
    { head: "Paper", perBook: 64, total: 128000 },
    { head: "Printing", perBook: 4, total: 8000 },
    { head: "Binding", perBook: 45, total: 67500 },
    { head: "Finishing", perBook: 300, total: 300000 },
    { head: "Packaging", perBook: 30, total: 36000 },
    { head: "Delivery", perBook: 50, total: 40000 },
  ],
  subtotal: { perBook: 150, total: 90000 },
  discountPercent: 5,
  gst: { perBook: 150, total: 90000 },
  grandTotal: { perBook: 150, total: 90000 },
};

/** Line items and totals shown in the Generate Invoice dialog. */
export const INVOICE_DRAFT = {
  items: [
    { item: "Hindi Textbook Class 8", qty: 2000, price: 64, total: 128000 },
    { item: "Lamination", qty: 2000, price: 4, total: 8000 },
  ],
  subtotal: 136000,
  discountPercent: 5,
  discountAmount: 6800,
  gstPercent: 18,
  gstAmount: 23256,
  grandTotal: 152456,
  paymentTerms: ["Net 30", "Net 15", "Net 45", "Due on receipt"],
};

/** Indian-format currency, e.g. 1,52,456. */
export function formatINR(value) {
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}
