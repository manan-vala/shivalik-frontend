/**
 * Support screen data.
 *
 * Transcribed from the Figma Support screens (nodes 1180:36896, 37141,
 * 37386) and their dialogs (New Ticket 37549/37586/37608, View Ticket 37631,
 * Escalate 37643, Edit article 37679, Add knowledge base 37689). Replace with
 * the Django API; SupportTicketsPage, KnowledgeBasePage and the dialogs
 * expect these shapes.
 */

/**
 * Support's three summary cards are StatCard's shape - a neutral number with
 * an optional trend badge - not SummaryCard's (a coloured number, no badge)
 * that Finance uses for a visually similar-looking row. Confirmed against the
 * source: all three numbers render in plain gray-900; only two carry a
 * separate small trend pill, exactly the delta badge StatCard already draws.
 *
 * "Avg resolution time" sets `tone` explicitly: the arrow points down
 * (fewer hours), but that pill is success-toned in Figma, not error - a
 * shorter resolution time is the good outcome. See StatCard for why
 * `direction` alone can't express that.
 */
export const SUPPORT_SUMMARY = [
  { label: "Open tickets", value: "14" },
  {
    label: "Avg resolution time",
    value: "4.2 hrs",
    delta: "0.3 hrs",
    direction: "down",
    tone: "success",
  },
  { label: "CSAT score", value: "94%", delta: "2%", direction: "up" },
];

/**
 * Status vocabulary, coloured exactly as read from Figma - not guessed from
 * the usual "red = bad" assumption. Closed uses the alert/orange family, not
 * error; Open uses the progress/indigo family, not info.
 */
export const TICKET_STATUS = {
  resolved: { tone: "success", label: "Resolved" },
  open: { tone: "progress", label: "Open" },
  closed: { tone: "alert", label: "Closed" },
  inProgress: { tone: "warning", label: "In Progress" },
};

export const CATEGORIES = ["Payments", "Distributory", "Inventory", "Marketing", "Finance", "Settings"];
export const SUBCATEGORIES = ["Order", "Invoice", "Login", "Account", "Other"];
export const RAISED_FOR = ["Self", "Client", "Vendor"];
export const PRIORITIES = ["High", "Medium", "Low"];
export const ASSIGNEES = ["Neha S", "Rohit M", "Asha K", "Vikram P", "Pooja Iyer"];

/**
 * Both Client Issues and Vendor Issues read from this one list, filtered by
 * `audience` - same construction as ClientsPage's status filter. The first
 * client-issue row and first vendor-issue row differ in Figma (their own
 * Subject line); every other row is identical demo content reused across
 * both screens, transcribed as shown.
 */
export const TICKETS = [
  {
    id: "TKT-10000",
    audience: "client",
    subject: "Payment no reflecting",
    raisedBy: "Mehta Book Depot",
    category: "Active",
    priority: "HIGH",
    assigned: "Neha S",
    sla: "29 min ago",
    status: "resolved",
    orderId: "ORD-5003",
    body: "The client reports a mismatch between the invoice line items and the delivered order. Requesting urgent review.",
  },
  {
    id: "TKT-10000",
    audience: "vendor",
    subject: "Stock requestion pending",
    raisedBy: "Mehta Book Depot",
    category: "Active",
    priority: "HIGH",
    assigned: "Neha S",
    sla: "29 min ago",
    status: "resolved",
    orderId: "ORD-5003",
    body: "The client reports a mismatch between the invoice line items and the delivered order. Requesting urgent review.",
  },
  {
    id: "TKT-10001",
    audience: "both",
    subject: "Wrong edition delivered",
    raisedBy: "Patel Book House",
    category: "Active",
    priority: "LOW",
    assigned: "Rohit M",
    sla: "49 min ago",
    status: "open",
    orderId: "ORD-5004",
    body: "Client received the previous edition of the requested title.",
  },
  {
    id: "TKT-10002",
    audience: "both",
    subject: "Distributor late",
    raisedBy: "Sharma pustak bhandaar",
    category: "Active",
    priority: "LOW",
    assigned: "Asha K",
    sla: "3 hr ago",
    status: "closed",
    orderId: "ORD-5005",
    body: "Distributor missed the scheduled pickup window.",
  },
  {
    id: "TKT-10003",
    audience: "both",
    subject: "Cannot login",
    raisedBy: "Anjali Book Store",
    category: "Active",
    priority: "HIGH",
    assigned: "Vikram P",
    sla: "5 hr ago",
    status: "open",
    orderId: "ORD-5006",
    body: "Client is locked out of their portal account after a password reset attempt.",
  },
  {
    id: "TKT-10004",
    audience: "both",
    subject: "Need discount on bulk textbooks",
    raisedBy: "Kapoors",
    category: "Active",
    priority: "LOW",
    assigned: "Neha S",
    sla: "14 hr ago",
    status: "closed",
    orderId: "ORD-5007",
    body: "Client is requesting a volume discount for a large repeat order.",
  },
  {
    id: "TKT-10005",
    audience: "both",
    subject: "App crashing on order",
    raisedBy: "Gupta Booksellers",
    category: "Active",
    priority: "HIGH",
    assigned: "Rohit M",
    sla: "1 d ago",
    status: "inProgress",
    orderId: "ORD-5008",
    body: "Mobile app crashes when submitting a new order with more than 10 line items.",
  },
  {
    id: "TKT-10006",
    audience: "both",
    subject: "Invoice mismatch on ORD-5003",
    raisedBy: "Singh brother books",
    category: "Active",
    priority: "LOW",
    assigned: "Asha K",
    sla: "1 d ago",
    status: "inProgress",
    orderId: "ORD-5003",
    body: "The client reports a mismatch between the invoice line items and the delivered order. Requesting urgent review.",
  },
  {
    id: "TKT-10007",
    audience: "both",
    subject: "Payment not reflecting",
    raisedBy: "Reddy book wholesale",
    category: "Active",
    priority: "HIGH",
    assigned: "Vikram P",
    sla: "1 d ago",
    status: "closed",
    orderId: "ORD-5009",
    body: "Client submitted payment three days ago; the order still shows as unpaid.",
  },
];

export const ARTICLE_CATEGORIES = ["Payment", "Distributory", "Inventory", "Marketing", "Finance", "Settings"];

export const ARTICLES = [
  {
    id: "kb-1",
    title: "How to record a payment",
    category: "Payments",
    lastUpdated: "12 Jan 2026",
    views: 40,
    helpful: 60,
    body: "",
  },
  {
    id: "kb-2",
    title: "Assigning distributor to book store",
    category: "Distributory",
    lastUpdated: "12 Jan 2026",
    views: 40,
    helpful: 60,
    body: "",
  },
  {
    id: "kb-3",
    title: "Settings reorder thresholds for titles",
    category: "Inventory",
    lastUpdated: "12 Jan 2026",
    views: 40,
    helpful: 60,
    body: "",
  },
  {
    id: "kb-4",
    title: "Building a broadcast campaign",
    category: "Marketing",
    lastUpdated: "12 Jan 2026",
    views: 40,
    helpful: 60,
    body: "",
  },
  {
    id: "kb-5",
    title: "GST reports and exports for publishers",
    category: "Finance",
    lastUpdated: "12 Jan 2026",
    views: 40,
    helpful: 60,
    body: "",
  },
  {
    id: "kb-6",
    title: "Managing User roles",
    category: "Settings",
    lastUpdated: "12 Jan 2026",
    views: 40,
    helpful: 60,
    body: "",
  },
];
