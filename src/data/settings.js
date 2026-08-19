/**
 * Settings sample data.
 *
 * Transcribed from the GOLDEN file's Settings screens:
 *   Business            node 1181:87164
 *   Users               node 1181:88147
 *   Roles & Permissions node 1181:87262
 *   Create a Role       node 1181:87651
 *
 * Replace with the Django settings endpoints once they exist.
 */

/* -------------------------------------------------------------- Business -- */

export const BUSINESS_PROFILE = {
  name: "Shivalik",
  gstNumber: "XXXXXXXXXXXXXX",
  category: "Print services",
  address: "Shivalik",
  logoFile: "",
};

export const BUSINESS_CATEGORIES = [
  "Print services",
  "Publishing",
  "Distribution",
  "Binding services",
];

/** Chips under "Operating cities" - removable, so this is editable state. */
export const OPERATING_CITIES = [
  "Mumbai",
  "Delhi",
  "Pune",
  "Banglore",
  "Mirzapur",
];

/* ----------------------------------------------------------------- Users -- */

/**
 * Role pill on a user row. These are short labels ("Finance", "Order") rather
 * than the full role names the permission matrix uses as columns - the frame
 * shows both spellings, and the pill is the abbreviated one.
 */
export const USER_ROLE = {
  owner: { label: "Owner", tone: "neutral" },
  finance: { label: "Finance", tone: "neutral" },
  order: { label: "Order", tone: "neutral" },
};

export const USERS = [
  { id: "user-1", name: "Arjun Verma", phone: "+91 XXXXX XXXXX", role: "owner" },
  { id: "user-2", name: "Arjun Verma", phone: "+91 XXXXX XXXXX", role: "finance" },
  { id: "user-3", name: "Arjun Verma", phone: "+91 XXXXX XXXXX", role: "order" },
  { id: "user-4", name: "Arjun Verma", phone: "+91 XXXXX XXXXX", role: "order" },
  { id: "user-5", name: "Arjun Verma", phone: "+91 XXXXX XXXXX", role: "finance" },
];

export const USER_ROLE_FILTERS = ["All Roles", "Owner", "Finance", "Order"];

/* ------------------------------------------------- Roles and permissions -- */

/**
 * Permission levels, in the order the cell control cycles through them.
 * `tone` is only used to tint the pill, not to carry the meaning - the label
 * is always visible.
 */
export const PERMISSION_LEVELS = [
  { id: "full", label: "Full" },
  { id: "view", label: "View Only" },
  { id: "none", label: "None" },
];

/** Matrix columns. */
export const PERMISSION_ROLES = ["Owner", "Order Manager", "Finance Manager"];

/**
 * Matrix rows and their current levels, indexed to PERMISSION_ROLES.
 *
 * DEVIATION: the frame spells the seventh row "Anaytics". Rendered as
 * "Analytics" - a typo, and it names a real section of the app whose route is
 * spelled correctly everywhere else.
 */
export const PERMISSION_SECTIONS = [
  { id: "dashboard", label: "Dashboard", levels: ["full", "view", "view"] },
  { id: "clients", label: "Clients", levels: ["full", "view", "view"] },
  { id: "order", label: "Order", levels: ["full", "full", "view"] },
  { id: "finance", label: "Finance", levels: ["full", "view", "full"] },
  { id: "vendors", label: "Vendors", levels: ["full", "view", "view"] },
  { id: "staff", label: "Staff", levels: ["full", "none", "none"] },
  { id: "analytics", label: "Analytics", levels: ["full", "view", "view"] },
  { id: "notification", label: "Notification", levels: ["full", "view", "view"] },
  { id: "support", label: "Support", levels: ["full", "view", "view"] },
  { id: "settings", label: "Settings", levels: ["full", "view", "view"] },
];

/** The role picker above the matrix. */
export const ROLE_SCOPES = ["Admin", "Owner", "Manager"];
