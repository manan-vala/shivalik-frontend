import { useMemo, useState } from "react";
import { AuthContext, ROLE_STORAGE_KEY } from "./auth-context.js";

/**
 * Auth / role provider — PLACEHOLDER
 * -----------------------------------------------------------------------------
 * Role gating is wired up so the route tree is correct from day one, but the
 * role is currently read from localStorage rather than a real session. Swap the
 * `useState` initialiser for the Django session/JWT call when the backend is
 * ready; nothing outside this file needs to change.
 *
 * Roles: shivalik_admin · golden_admin · vendor · client · golden_client
 *
 * The context and `useAuth` hook live in ./auth-context.js.
 */
export function AuthProvider({ children }) {
  const [role, setRoleState] = useState(
    () => localStorage.getItem(ROLE_STORAGE_KEY) || null
  );

  const value = useMemo(
    () => ({
      role,
      isAuthenticated: Boolean(role),
      setRole(next) {
        if (next) localStorage.setItem(ROLE_STORAGE_KEY, next);
        else localStorage.removeItem(ROLE_STORAGE_KEY);
        setRoleState(next);
      },
      signOut() {
        localStorage.removeItem(ROLE_STORAGE_KEY);
        setRoleState(null);
      },
    }),
    [role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
