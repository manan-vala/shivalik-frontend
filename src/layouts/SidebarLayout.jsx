import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar.jsx";
import { useAuth } from "../lib/auth-context.js";

/**
 * Desktop shell: the shared Sidebar plus a scrolling main column.
 * Used by Shivalik Admin, Golden Admin and the Vendor portal.
 *
 * Figma (node 790:56280): sidebar 312, main fills the rest and carries its own
 * 32px gutter, supplied by PageContainer rather than here so a screen can opt
 * out for full-bleed content.
 */
export default function SidebarLayout({ portal }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Placeholder identity until the backend session exists. See lib/auth.jsx.
  const user = { name: "Manan Vala", email: "manan@shivalik.example" };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        portal={portal}
        user={user}
        onSignOut={() => {
          signOut();
          navigate("/login", { replace: true });
        }}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
