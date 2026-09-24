/**
 * API client — the one way the frontend talks to Django.
 * -----------------------------------------------------------------------------
 * Every request goes to the relative `/api/v1` prefix. In development Vite
 * proxies it to Django (vite.config.js, `API_PROXY_TARGET`), so the browser
 * only ever sees one origin: no CORS, and no second base URL to drift out of
 * sync with this one.
 *
 * Auth: the access token rides on every request. simplejwt's access tokens
 * live five minutes, so a 401 is normally just an expired token — the client
 * trades the refresh token for a new one and replays the request once. Only
 * when that fails too is the session over, and the user is sent to /login.
 */

const BASE_URL = "/api/v1";

export const TOKEN_STORAGE_KEY = "shivalik.dev.token";
export const REFRESH_TOKEN_STORAGE_KEY = "shivalik.dev.refresh-token";
export const ROLE_STORAGE_KEY = "shivalik.dev.role";
export const USER_STORAGE_KEY = "shivalik.dev.user";

// Anonymous routes. A 401 from these means "wrong credentials", not "session
// expired", so they must never trigger a refresh or a redirect.
const PUBLIC_ENDPOINTS = ["/auth/login/", "/auth/token/refresh/"];

/** An HTTP error with the response body attached, so callers can read DRF's field errors. */
export class ApiError extends Error {
  constructor(status, data) {
    super(describeError(status, data));
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Turns a DRF error body into one readable sentence.
 *
 *   {"detail": "…"}                      -> "…"
 *   {"isbn": ["already exists."]}        -> "isbn: already exists."
 *   ["Each entry must be an object."]    -> "Each entry must be an object."
 */
function describeError(status, data) {
  if (!data) return `Request failed (HTTP ${status}).`;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(String).join(" ");
  if (data.detail) return String(data.detail);

  const fields = Object.entries(data).map(([field, messages]) => {
    const text = Array.isArray(messages) ? messages.join(" ") : String(messages);
    return field === "non_field_errors" ? text : `${field}: ${text}`;
  });
  return fields.length ? fields.join(" ") : `Request failed (HTTP ${status}).`;
}

export function clearSession() {
  for (const key of [
    TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
    ROLE_STORAGE_KEY,
    USER_STORAGE_KEY,
  ]) {
    localStorage.removeItem(key);
  }
}

function endSession() {
  clearSession();
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

// Shared by every request that hits a 401 at the same moment, so a page that
// fires four requests on load refreshes once, not four times.
let refreshInFlight = null;

function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refresh = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (!refresh) return false;

      const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return false;

      const tokens = await response.json();
      localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access);
      // Only present if the backend turns on ROTATE_REFRESH_TOKENS.
      if (tokens.refresh) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh);
      return true;
    })()
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function buildUrl(endpoint, params) {
  const url = `${BASE_URL}${endpoint}`;
  if (!params) return url;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.append(key, value);
  }
  const qs = query.toString();
  return qs ? `${url}?${qs}` : url;
}

function send(url, { body, headers, ...config }) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return fetch(url, {
    method: body === undefined ? "GET" : "POST",
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function readBody(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * `apiClient("/inventory/racks/", { params: { page: 2 } })`
 * `apiClient("/inventory/books/", { body: {...} })`            -> POST
 * `apiClient("/inventory/vendors/1/", { method: "PATCH", body })`
 *
 * Resolves with the parsed JSON (null for 204). Rejects with an `ApiError`.
 */
export async function apiClient(endpoint, { params, ...config } = {}) {
  const url = buildUrl(endpoint, params);
  const sentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  let response = await send(url, config);

  if (response.status === 401 && !PUBLIC_ENDPOINTS.includes(endpoint)) {
    // If another request refreshed the token while this one was in flight,
    // just retry with the new one rather than refreshing again.
    const renewed =
      localStorage.getItem(TOKEN_STORAGE_KEY) !== sentToken || (await refreshAccessToken());
    if (renewed) {
      response = await send(url, config);
    }
    if (response.status === 401) {
      endSession();
    }
  }

  const data = await readBody(response);
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

/**
 * Every item of a paginated list, following `next` until it runs out.
 *
 * DRF pages at 25. A screen that takes only the first page silently loses
 * everything after it — the warehouse map used to stop at rack 25. Also
 * accepts a bare-list response, which a few custom actions still return.
 */
export async function fetchAll(endpoint, { params } = {}) {
  const items = [];
  let page = await apiClient(endpoint, { params });

  for (;;) {
    if (Array.isArray(page)) return page;
    items.push(...(page?.results ?? []));
    if (!page?.next) return items;

    // `next` is absolute and names Django's own host, which the browser
    // cannot reach through the proxy. Keep the path and query only.
    const next = new URL(page.next);
    page = await apiClient(next.pathname.replace(BASE_URL, "") + next.search);
  }
}
