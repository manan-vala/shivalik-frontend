import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context.js";
import {
  apiClient,
  clearSession,
  REFRESH_TOKEN_STORAGE_KEY,
  ROLE_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "./api/client.js";

/**
 * Auth provider
 * -----------------------------------------------------------------------------
 * Signs in against Django (`/auth/login/` -> JWT pair) and keeps the signed-in
 * employee from `/auth/me/`. Tokens, the employee and the portal role live in
 * localStorage so a reload stays signed in; the API client refreshes expired
 * access tokens on its own (lib/api/client.js).
 *
 * Portal roles: shivalik_admin · golden_admin · vendor · client · golden_client
 *
 * The context and `useAuth` hook live in ./auth-context.js.
 */

/**
 * Which portal an employee belongs in.
 *
 * Every account the backend can issue today is a Shivalik `Employee` — staff
 * of the Shivalik warehouse — so every one of them lands in the Shivalik
 * Admin portal, whatever their `role` (ADMIN, INVENTORY_MANAGER, …). What
 * they may *do* there is the backend's call, enforced per endpoint. The other
 * portals (Golden, vendor, client) have no backend identity yet; route them
 * from here when they do.
 */
function portalRoleFor(/* employee */) {
  return "shivalik_admin";
}

function readStoredSession() {
  if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return { role: null, user: null };

  let user;
  try {
    user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  } catch {
    user = null;
  }
  return { role: localStorage.getItem(ROLE_STORAGE_KEY), user };
}

function storeSession({ role, user }) {
  localStorage.setItem(ROLE_STORAGE_KEY, role);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  // A stored session may be stale — renamed, or deactivated since. Re-read
  // the employee once per load; a dead session makes the client send the
  // user to /login on its own.
  const signedIn = Boolean(session.role);
  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    apiClient("/auth/me/")
      .then((user) => {
        if (!active) return;
        const next = { role: portalRoleFor(user), user };
        storeSession(next);
        setSession(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [signedIn]);

  const value = useMemo(
    () => ({
      role: session.role,
      user: session.user,
      isAuthenticated: Boolean(session.role && localStorage.getItem(TOKEN_STORAGE_KEY)),

      /** Resolves with `{ user, role }`; rejects with the API's error. */
      async signIn(email, password) {
        const tokens = await apiClient("/auth/login/", {
          body: { email, password },
        });
        localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh);

        try {
          const user = await apiClient("/auth/me/");
          const next = { role: portalRoleFor(user), user };
          storeSession(next);
          setSession(next);
          return next;
        } catch (error) {
          clearSession();
          throw error;
        }
      },

      signOut() {
        clearSession();
        setSession({ role: null, user: null });
      },
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
