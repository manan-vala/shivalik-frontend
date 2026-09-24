import { createContext, useContext } from "react";

/**
 * Auth context + hook, kept apart from <AuthProvider> so each file exports
 * only one kind of thing (react-refresh requires this to hot-reload cleanly).
 */

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
