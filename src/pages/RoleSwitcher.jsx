import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context.js";
import { PORTAL_LIST, landingPathForRole } from "../routes/portals.js";
import Icon from "../components/ui/Icon.jsx";

/**
 * Dev role switcher - PLACEHOLDER for the real sign-in screen.
 *
 * Lets you jump into any portal without a backend. Replace with the designed
 * LOGIN PAGE (Figma node 1181:89498) once auth exists; the redirect contract
 * (landingPathForRole) stays the same.
 */
export default function RoleSwitcher() {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  function enter(portal) {
    setRole(portal.role);
    navigate(landingPathForRole(portal.role), { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-border-default bg-surface p-8 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-xs">Choose a portal</h1>
          <p className="text-sm text-tertiary">
            Stand-in for sign-in. Pick a role to enter that portal.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {PORTAL_LIST.map((portal) => (
            <button
              key={portal.id}
              type="button"
              onClick={() => enter(portal)}
              className="flex items-center justify-between rounded-md border border-border-default px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-primary">
                  {portal.label}
                </span>
                <span className="text-xs text-tertiary">
                  {portal.basePath} / {portal.shell}
                </span>
              </span>
              <Icon
                name="chevron-down"
                size="md"
                className="-rotate-90 text-placeholder"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
