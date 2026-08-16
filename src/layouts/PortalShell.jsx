import SidebarLayout from "./SidebarLayout.jsx";
import MobileLayout from "./MobileLayout.jsx";

/** Picks the shell a portal declares in the registry. */
export default function PortalShell({ portal }) {
  return portal.shell === "mobile" ? (
    <MobileLayout portal={portal} />
  ) : (
    <SidebarLayout portal={portal} />
  );
}
