import { useMemo, useState } from "react";
import { AuthContext, ROLE_STORAGE_KEY } from "./auth-context.js";
import { apiClient } from "./api/client.js";

export const TOKEN_STORAGE_KEY = "shivalik.dev.token";
export const REFRESH_TOKEN_STORAGE_KEY = "shivalik.dev.refresh-token";

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
    () => localStorage.getItem(TOKEN_STORAGE_KEY)
      ? localStorage.getItem(ROLE_STORAGE_KEY) || null
      : null
  );

  const value = useMemo(
    () => ({
      role,
      isAuthenticated: Boolean(role && localStorage.getItem(TOKEN_STORAGE_KEY)),
      async signIn(email, password) {
        const tokens = await apiClient("/auth/login/", {
          body: { email, password },
        });

        localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh);

        try {
          const user = await apiClient("/auth/me/");
          const nextRole = user.is_staff || user.role === "ADMIN"
            ? "shivalik_admin"
            : "shivalik_admin";
          localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
          setRoleState(nextRole);
          return user;
        } catch (error) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          throw error;
        }
      },
      setRole(next) {
        if (next) localStorage.setItem(ROLE_STORAGE_KEY, next);
        else localStorage.removeItem(ROLE_STORAGE_KEY);
        setRoleState(next);
      },
      signOut() {
        localStorage.removeItem(ROLE_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        setRoleState(null);
      },
    }),
    [role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
