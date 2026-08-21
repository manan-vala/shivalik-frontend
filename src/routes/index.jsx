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
import SupportTicketsPage from "../pages/shivalik-admin/SupportTicketsPage.jsx";
import KnowledgeBasePage from "../pages/shivalik-admin/KnowledgeBasePage.jsx";
import VendorsPage from "../pages/shivalik-admin/VendorsPage.jsx";
import OrdersPage from "../pages/shivalik-admin/OrdersPage.jsx";
import AnalyticsSalesPage from "../pages/shivalik-admin/AnalyticsSalesPage.jsx";
import AnalyticsOperationalPage from "../pages/shivalik-admin/AnalyticsOperationalPage.jsx";
import AnalyticsFinancialPage from "../pages/shivalik-admin/AnalyticsFinancialPage.jsx";
import SettingsPage from "../pages/shivalik-admin/SettingsPage.jsx";
import WarehouseMapPage from "../pages/shivalik-admin/WarehouseMapPage.jsx";
import EmptyRacksPage from "../pages/shivalik-admin/EmptyRacksPage.jsx";

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
 * The Clients sub-routes share one page - the filter is a prop, not a copy,
 * and Support's two ticket screens share one page the same way.
 */
const BUILT_PAGES = {
  "shivalik-admin:dashboard": <DashboardPage />,
  "shivalik-admin:finance": <FinancePage />,
  "shivalik-admin:staff": <StaffPage />,
  "shivalik-admin:staff/attendance": <AttendancePage />,
  "shivalik-admin:clients": <ClientsPage filter="all" />,
  "shivalik-admin:clients/active": <ClientsPage filter="active" />,
  "shivalik-admin:clients/inactive": <ClientsPage filter="inactive" />,
  "shivalik-admin:support/client-issues": <SupportTicketsPage audience="client" />,
  "shivalik-admin:support/vendor-issues": <SupportTicketsPage audience="vendor" />,
  "shivalik-admin:support/knowledge-base": <KnowledgeBasePage />,
  "shivalik-admin:vendors": <VendorsPage filter="all" />,
  "shivalik-admin:vendors/printing": <VendorsPage filter="printing" />,
  "shivalik-admin:vendors/binding": <VendorsPage filter="binding" />,
  "shivalik-admin:vendors/active": <VendorsPage filter="active" />,
  "shivalik-admin:vendors/inactive": <VendorsPage filter="inactive" />,
  "shivalik-admin:orders": <OrdersPage filter="all" />,
  "shivalik-admin:orders/design": <OrdersPage filter="design" />,
  "shivalik-admin:orders/printing": <OrdersPage filter="printing" />,
  "shivalik-admin:orders/binding": <OrdersPage filter="binding" />,
  "shivalik-admin:orders/ready-for-dispatch": <OrdersPage filter="ready-for-dispatch" />,
  "shivalik-admin:orders/dispatched": <OrdersPage filter="dispatched" />,
  "shivalik-admin:orders/delivered": <OrdersPage filter="delivered" />,
  "shivalik-admin:analytics/sales": <AnalyticsSalesPage />,
  "shivalik-admin:analytics/operational": <AnalyticsOperationalPage />,
  "shivalik-admin:analytics/financial": <AnalyticsFinancialPage />,
  "shivalik-admin:settings": <SettingsPage />,
  "shivalik-admin:inventory-map/warehouse-map": <WarehouseMapPage />,
  "shivalik-admin:inventory-map/empty-racks": <EmptyRacksPage />,
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
