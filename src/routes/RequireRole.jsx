import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context.js";
import { landingPathForRole } from "./portals.js";

/**
 * Blocks a portal unless the signed-in role matches.
 *
 * Not signed in     -> /login, remembering where they were headed
 * Signed in, wrong  -> their own portal's landing screen (never a dead end)
 */
export default function RequireRole({ role, children }) {
  const { role: currentRole, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (currentRole !== role) {
    return <Navigate to={landingPathForRole(currentRole)} replace />;
  }

  return children;
}
