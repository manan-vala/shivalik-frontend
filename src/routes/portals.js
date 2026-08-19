/**
 * Portal registry
 * -----------------------------------------------------------------------------
 * The single source of truth for what portals exist, who may enter them, and
 * what sits in their navigation. Route tables, sidebars, bottom nav bars and
 * role guards all read from here — adding a screen means editing this file,
 * not five separate ones.
 *
 * Structure mirrors FINAL SCREENS in Figma (file VVZ3VLv1ftnqITsHBh8TEU).
 * Nav labels and icon names are taken from the designed sidebars, so the
 * `icon` values below all resolve against the generated sprite.
 *
 * `shell` picks the layout: "admin" = 1440px sidebar, "vendor" = 1280px
 * sidebar, "mobile" = 390px top bar + bottom nav.
 */

export const PORTALS = {
  shivalikAdmin: {
    id: "shivalik-admin",
    label: "Shivalik Admin",
    basePath: "/admin",
    role: "shivalik_admin",
    shell: "admin",
    // Order and icons match the designed sidebar (nodes 790:56290, 1180:34771).
    //
    // `children`    renders an expandable sub-menu.
    // `collapsible` renders the chevron without sub-items - used where the
    //               design shows a disclosure control but no screen in the file
    //               reveals what sits under it. Fill these in as those screens
    //               are designed rather than guessing.
    // `badge`       renders a count pill on the right.
    nav: [
      { path: "dashboard", label: "Dashboard", icon: "home" },
      {
        path: "clients",
        label: "Clients",
        icon: "users",
        // Sub-items are visible in the Clients screen (node 790:56290).
        children: [
          { path: "clients", label: "All", end: true },
          { path: "clients/active", label: "Active" },
          { path: "clients/inactive", label: "Inactive" },
        ],
      },
      {
        path: "vendors",
        label: "Vendors",
        icon: "truck",
        // Sub-items are visible in the Vendors screen (node 1180:48387).
        children: [
          { path: "vendors", label: "All", end: true },
          { path: "vendors/printing", label: "Printing Vendors" },
          { path: "vendors/binding", label: "Binding Vendors" },
          { path: "vendors/active", label: "Active" },
          { path: "vendors/inactive", label: "Inactive" },
        ],
      },
      {
        path: "orders",
        label: "Orders",
        icon: "check-square",
        // Sub-items are visible in the Orders screen (node 1180:51161). Each
        // segment after the first is an ORDER_STATUS key, so the route and the
        // status it filters by are the same string.
        children: [
          { path: "orders", label: "All Orders", end: true },
          { path: "orders/design", label: "In Design" },
          { path: "orders/printing", label: "In Printing" },
          { path: "orders/binding", label: "In Binding" },
          { path: "orders/ready-for-dispatch", label: "Ready For Dispatch" },
          { path: "orders/dispatched", label: "Dispatched" },
          { path: "orders/delivered", label: "Delivered" },
        ],
      },
      { path: "finance", label: "Finance", icon: "coin-stack" },
      {
        path: "staff",
        label: "Staff",
        icon: "user",
        // Sub-items are visible in the Staff screens (node 1181:84436/84672).
        children: [
          { path: "staff", label: "All Staff", end: true },
          { path: "staff/attendance", label: "Attendance" },
        ],
      },
      { path: "notifications", label: "Notification", icon: "bell", badge: 10 },
      {
        path: "analytics",
        label: "Analytics",
        icon: "bar-chart-2",
        // Derived from the three designed analytics screens.
        children: [
          { path: "analytics/sales", label: "Sales" },
          { path: "analytics/distribution", label: "Distribution" },
          { path: "analytics/financial", label: "Financial" },
        ],
      },
    ],
    footerNav: [
      {
        path: "support",
        label: "Support",
        icon: "life-buoy",
        // Sub-items are visible in the Support screens (node 1180:36896).
        children: [
          { path: "support/client-issues", label: "Client Issues" },
          { path: "support/vendor-issues", label: "Vendor Issues" },
          { path: "support/knowledge-base", label: "Knowledge Base" },
        ],
      },
      { path: "settings", label: "Settings", icon: "settings" },
    ],
  },

  goldenAdmin: {
    id: "golden-admin",
    label: "Golden Admin",
    basePath: "/golden",
    role: "golden_admin",
    shell: "admin",
    nav: [
      { path: "dashboard", label: "Dashboard", icon: "home" },
      { path: "clients", label: "Clients", icon: "users" },
      { path: "orders", label: "Orders", icon: "check-square" },
      { path: "payments", label: "Payments", icon: "coin-stack" },
      { path: "marketing", label: "Marketing", icon: "users-plus" },
      { path: "staff", label: "Staff", icon: "user" },
      { path: "analytics", label: "Analytics", icon: "bar-chart-2" },
      { path: "notifications", label: "Notifications", icon: "bell" },
      { path: "inventory", label: "Inventory", icon: "wallet" },
      { path: "distributors", label: "Distributors", icon: "truck" },
    ],
    footerNav: [
      { path: "support", label: "Support", icon: "life-buoy" },
      { path: "settings", label: "Settings", icon: "settings" },
    ],
  },

  shivalikVendor: {
    id: "shivalik-vendor",
    label: "Shivalik Vendor Portal",
    basePath: "/vendor",
    role: "vendor",
    shell: "vendor",
    nav: [
      { path: "dashboard", label: "Dashboard", icon: "home" },
      { path: "jobs", label: "My Jobs", icon: "check-square" },
      { path: "stock", label: "My Stock", icon: "wallet" },
      { path: "payments", label: "Payments", icon: "coin-stack" },
      { path: "notifications", label: "Notifications", icon: "bell" },
      { path: "support", label: "Support", icon: "life-buoy" },
      { path: "profile", label: "My Profile", icon: "user" },
    ],
    footerNav: [],
  },

  shivalikClient: {
    id: "shivalik-client",
    label: "Shivalik Client",
    basePath: "/client",
    role: "client",
    shell: "mobile",
    // Mobile bottom bar carries four items (node 1079:92769); the rest are
    // reachable from within screens rather than the bar.
    nav: [
      { path: "dashboard", label: "Home", icon: "home", inBottomBar: true },
      { path: "orders", label: "Orders", icon: "truck", inBottomBar: true },
      { path: "payments", label: "Payments", icon: "coin-stack", inBottomBar: true },
      { path: "support", label: "Support", icon: "life-buoy", inBottomBar: true },
      { path: "notifications", label: "Notifications", icon: "bell" },
      { path: "profile", label: "My Profile", icon: "user" },
    ],
    footerNav: [],
  },

  goldenClient: {
    id: "golden-client",
    label: "Golden Client",
    basePath: "/golden-client",
    role: "golden_client",
    shell: "mobile",
    nav: [
      { path: "dashboard", label: "Home", icon: "home", inBottomBar: true },
      { path: "catalog", label: "Catalog", icon: "search", inBottomBar: true },
      { path: "shipments", label: "Shipments", icon: "truck", inBottomBar: true },
      { path: "ledger", label: "Ledger", icon: "coin-stack", inBottomBar: true },
      { path: "orders", label: "Orders", icon: "check-square" },
    ],
    footerNav: [],
  },
};

export const PORTAL_LIST = Object.values(PORTALS);

/**
 * Every routable path in a portal, in sidebar order.
 *
 * A nav item with `children` is a disclosure control rather than a destination,
 * so only its children are routable. The route tree and the landing-path
 * lookup both read from here, which keeps them from disagreeing.
 */
export function flattenNav(portal) {
  return [...portal.nav, ...portal.footerNav].flatMap((item) =>
    item.children?.length
      ? item.children.map((child) => ({ ...child, icon: item.icon }))
      : [item]
  );
}

/** Where a user lands after signing in. */
export function landingPathForRole(role) {
  const portal = PORTAL_LIST.find((p) => p.role === role);
  if (!portal) return "/login";

  // Not `nav[0]` directly: if the first item ever gains children it stops being
  // a destination, and this would hand out a path with no route behind it.
  const [first] = flattenNav(portal);
  return `${portal.basePath}/${first.path}`;
}
