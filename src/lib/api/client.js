/**
 * Standard API Client for backend communication
 */

const BASE_URL = "/api/v1";

export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const headers = { "Content-Type": "application/json" };

  // If JWT token exists in localStorage, attach it
  const token = localStorage.getItem("shivalik.dev.token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let data;
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    data = await response.json();

    if (response.ok) {
      return data;
    }

    if (response.status === 401 && !endpoint.startsWith("/auth/login")) {
      localStorage.removeItem("shivalik.dev.token");
      localStorage.removeItem("shivalik.dev.refresh-token");
      localStorage.removeItem("shivalik.dev.role");
      window.location.assign("/login");
    }

    throw new Error(data?.detail || data?.message || `HTTP ${response.status} Error`);
  } catch (err) {
    return Promise.reject(err.message || err);
  }
}
