import { createBrowserRouter, Navigate } from "react-router-dom";
import { PORTAL_LIST, flattenNav } from "./portals.js";
import PortalShell from "../layouts/PortalShell.jsx";
import RequireRole from "./RequireRole.jsx";
import Placeholder from "../pages/Placeholder.jsx";
import RoleSwitcher from "../pages/RoleSwitcher.jsx";
import RootRedirect from "../pages/RootRedirect.jsx";
import ClientsPage from "../pages/shivalik-admin/ClientsPage.jsx";
import DashboardPage from "../pages/shivalik-admin/DashboardPage.jsx";
import FinancePage from "../pages/shivalik-admin/FinancePage.jsx";
import StaffPage from "../pages/shivalik-admin/StaffPage.jsx";
import AttendancePage from "../pages/shivalik-admin/AttendancePage.jsx";

/**
 * Route tree
 * -----------------------------------------------------------------------------
 * Paths are generated from the portal registry, so adding a screen is one line
 * in portals.js. Screens that have actually been built are registered in
 * BUILT_PAGES below; everything else falls back to <Placeholder>.
 *
 *   /                  -> redirect to the signed-in role's landing screen
 *   /login             -> dev role switcher (placeholder for real auth)
 *   /admin/*           Shivalik Admin   (role: shivalik_admin)
 *   /golden/*          Golden Admin     (role: golden_admin)
 *   /vendor/*          Shivalik Vendor  (role: vendor)
 *   /client/*          Shivalik Client  (role: client, mobile)
 *   /golden-client/*   Golden Client    (role: golden_client, mobile)
 */

/**
 * Real screens, keyed by "<portalId>:<path>".
 * The Clients sub-routes share one page - the filter is a prop, not a copy.
 */
const BUILT_PAGES = {
  "shivalik-admin:dashboard": <DashboardPage />,
  "shivalik-admin:finance": <FinancePage />,
  "shivalik-admin:staff": <StaffPage />,
  "shivalik-admin:staff/attendance": <AttendancePage />,
  "shivalik-admin:clients": <ClientsPage filter="all" />,
  "shivalik-admin:clients/active": <ClientsPage filter="active" />,
  "shivalik-admin:clients/inactive": <ClientsPage filter="inactive" />,
};

function portalRoute(portal) {
  const items = flattenNav(portal);

  return {
    path: portal.basePath,
    element: (
      <RequireRole role={portal.role}>
        <PortalShell portal={portal} />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to={items[0].path} replace /> },
      ...items.map((item) => ({
        path: item.path,
        element: BUILT_PAGES[`${portal.id}:${item.path}`] ?? (
          <Placeholder portal={portal} item={item} />
        ),
      })),
      { path: "*", element: <Placeholder portal={portal} notFound /> },
    ],
  };
}

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <RoleSwitcher /> },
  ...PORTAL_LIST.map(portalRoute),
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
