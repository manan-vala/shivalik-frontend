import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context.js";
import { landingPathForRole } from "../routes/portals.js";

/** Sends "/" to the signed-in role's landing screen, or to sign-in. */
export default function RootRedirect() {
  const { role } = useAuth();
  return <Navigate to={role ? landingPathForRole(role) : "/login"} replace />;
}
