import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context.js";
import { landingPathForRole } from "../routes/portals.js";
import { useState } from "react";

/**
 * Backend sign-in for the staff portal.
 */
export default function RoleSwitcher() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await signIn(email, password);
      const role = user.is_staff || user.role === "ADMIN"
        ? "shivalik_admin"
        : "shivalik_admin";
      navigate(landingPathForRole(role), { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-border-default bg-surface p-8 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-xs">Sign in to Shivalik</h1>
          <p className="text-sm text-tertiary">
            Use your approved staff account to access the warehouse.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-primary">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border border-border-default px-3 py-2 font-normal outline-none focus:border-brand"
              autoComplete="email"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-primary">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-border-default px-3 py-2 font-normal outline-none focus:border-brand"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="text-sm text-error-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
