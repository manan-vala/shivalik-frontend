/**
 * Analytics sample data.
 *
 * Transcribed from the GOLDEN file's three Analytics screens:
 *   Sales       node 1180:52808
 *   Operational node 1180:53018
 *   Financial   node 1180:53377
 *
 * Replace with the Django reporting endpoints once they exist - the three
 * pages and the chart components expect these shapes.
 *
 * NOTES ON THE MOCKUP DATA
 *  - The tables repeat one row ("5. Rahul Book Bazar", $15K / 40 / +5%) for
 *    most of their length, and the numbering restarts at 5 partway down. Rows
 *    are given distinct names and a correct 1..10 sequence here; duplicate
 *    keys break list rendering and a broken sequence would just look like a
 *    bug in the app.
 *  - Chart values are read off the rendered frames, so they are the right
 *    shape and relative magnitude rather than exact figures.
 */

/* ---------------------------------------------------------------- Sales -- */

/** "Revenue by city" - single series, categorical (node 1180:52808). */
export const REVENUE_BY_CITY = [
  { label: "Hyderabad", value: 620 },
  { label: "Mumbai", value: 900 },
  { label: "Chennai", value: 520 },
  { label: "Bengaluru", value: 700 },
  { label: "Ahemdabad", value: 480 },
  { label: "Kolkata", value: 660 },
  { label: "Pune", value: 690 },
  { label: "Jaipur", value: 640 },
  { label: "Surat", value: 610 },
  { label: "Indore", value: 730 },
];

/** "Vendor breakdown" - part-to-whole, unordered categories. */
export const VENDOR_BREAKDOWN = [
  { label: "Fiction", value: 34 },
  { label: "Non-Fiction", value: 12 },
  { label: "Academic", value: 22 },
  { label: "Comic", value: 18 },
  { label: "Reference", value: 14 },
];

/**
 * "Order Frequency Trend" - drawn on both the Sales and Operational screens,
 * so one dataset serves both. Same two-series shape RevenueTrendChart takes.
 */
export const ORDER_FREQUENCY_TREND = {
  months: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],
  series: [
    {
      id: "orders",
      label: "Orders",
      values: [42, 45, 41, 48, 52, 50, 58, 63, 61, 68, 72, 78],
    },
    {
      id: "repeat-orders",
      label: "Repeat orders",
      values: [22, 24, 21, 26, 28, 27, 31, 34, 33, 36, 38, 41],
    },
  ],
};

/** "Top #10 Clients". */
export const TOP_CLIENTS = [
  "Banerjee Book Seller",
  "Acharya Book Traders",
  "Modi ji Pustak bhandar",
  "Meloni Traders",
  "Rahul Book Bazar",
  "Sinha Book House",
  "Verma Publications",
  "Nair Book Depot",
  "Iyer Book Mart",
  "Chopra Book Stores",
].map((name, i) => ({
  rank: i + 1,
  name,
  avgValue: "$15K",
  orders: 40,
  revenue: i < 4 ? "$1.8 lakh" : "$1.7 lakh",
  growth: "+5%",
}));

/* ---------------------------------------------------------- Operational -- */

/** "Fill rate by distributor" - the bar is a ProgressBar, not a chart. */
export const FILL_RATE_BY_DISTRIBUTOR = TOP_CLIENTS.map((c) => ({
  rank: c.rank,
  name: c.name,
  fillRate: 60,
  deliveries: "+5%",
}));

/** "Cost per delivery". */
export const COST_PER_DELIVERY = TOP_CLIENTS.map((c) => ({
  rank: c.rank,
  name: c.name,
  deliveries: 120,
  totalCost: 18000,
  costPerDelivery: 150,
}));

/* ------------------------------------------------------------ Financial -- */

/**
 * "Revenue vs Collected" - two series grouped by month.
 *
 * `which` drives the Revenue/Collected toggle above the chart: the frame
 * shows both bars drawn at once with the toggle picking which is emphasised,
 * so both series are always supplied and the page decides what to show.
 */
export const REVENUE_VS_COLLECTED = {
  categories: ["Sep", "Oct", "Nov", "Dec"],
  series: [
    { id: "revenue", label: "Revenue", values: [620, 640, 700, 780] },
    { id: "collected", label: "Collected", values: [900, 380, 720, 880] },
  ],
};

/**
 * "AR ageing" - ordered buckets stacked per account.
 * Oldest bucket first, which is the order the ramp is drawn in.
 */
export const AR_AGEING = {
  categories: [
    "Abc", "Bcd", "cde", "def", "efg", "ghi",
    "Hij", "ijk", "jkl", "lmn", "mno", "nop",
  ],
  buckets: [
    { id: "90d+", label: "90d+", values: [30, 42, 26, 34, 22, 46, 30, 32, 28, 40, 44, 24] },
    { id: "61-90d", label: "61-90d", values: [26, 30, 22, 28, 24, 32, 26, 24, 26, 30, 32, 20] },
    { id: "31-60d", label: "31-60d", values: [22, 26, 20, 24, 22, 26, 22, 22, 22, 26, 28, 18] },
    { id: "0-30d", label: "0-30d", values: [18, 22, 16, 20, 18, 22, 18, 18, 18, 22, 24, 16] },
  ],
};

/** "GST Summary". */
export const GST_SUMMARY = [
  "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
  "Jan 2026", "Feb 2026", "March 2026", "April 2026", "May 2026",
].map((month, i) => ({
  rank: i + 1,
  month,
  taxable: "12,40,000",
  gst: "2,23,200",
  net: "14,63,200",
}));
