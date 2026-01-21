// src/api/axios.js
// Lightweight fetch wrapper for API requests
// Supports JWT auth, dynamic baseURL, logout, and better error handling

let baseURL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:5000/api";

const defaultHeaders = { "Content-Type": "application/json" };
let globalHeaders = {};

// Utility: fetch wrapper
async function request(method, url, data = null, opts = {}) {
  const headers = { ...defaultHeaders, ...globalHeaders, ...(opts.headers || {}) };
  const fetchOpts = { method, headers };

  // Handle FormData (for file uploads)
  if (data instanceof FormData) {
    // Remove Content-Type header so browser can set it with boundary
    delete headers["Content-Type"];
    fetchOpts.body = data;
  } else if (data != null && method !== "GET") {
    fetchOpts.body = JSON.stringify(data);
  }

  // Debug: Log headers for form data requests
  if (data instanceof FormData) {
    console.log("FormData request headers:", headers);
  }

  if (opts.withCredentials) {
    fetchOpts.credentials = "include";
  }

  let resp;
  try {
    resp = await fetch(baseURL + url, fetchOpts);
  } catch (err) {
    // Network error or CORS issue
    throw new Error(
      `Network error: Could not reach ${baseURL + url}. Check server or CORS.`
    );
  }

  const contentType = resp.headers.get("content-type") || "";
  let parsed = null;

  try {
    if (contentType.includes("application/json")) parsed = await resp.json();
    else parsed = await resp.text();
  } catch (_) {
    parsed = null;
  }

  const axiosLikeResponse = { data: parsed, status: resp.status, ok: resp.ok, headers: resp.headers };

  if (!resp.ok) {
    const error = new Error(
      (parsed && parsed.message) || `Request failed with status ${resp.status}`
    );
    error.response = axiosLikeResponse;
    throw error;
  }

  return axiosLikeResponse;
}

const api = {
  get: (url, opts) => request("GET", url, null, opts),
  post: (url, data, opts) => request("POST", url, data, opts),
  put: (url, data, opts) => request("PUT", url, data, opts),
  patch: (url, data, opts) => request("PATCH", url, data, opts),
  delete: (url, data, opts) => request("DELETE", url, data, opts),

  // Dynamically change base URL
  setBaseURL: (newBaseURL) => {
    if (newBaseURL) baseURL = newBaseURL.replace(/\/$/, "");
  },

  // Set JWT token globally for all requests
  setAuthToken: (token) => {
    if (token) globalHeaders["Authorization"] = `Bearer ${token}`;
    else delete globalHeaders["Authorization"];
  },

  // Clear auth + localStorage (logout)
  logout: () => {
    delete globalHeaders["Authorization"];
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect to login
  },

  // Set custom global headers
  setGlobalHeader: (key, value) => {
    if (value) globalHeaders[key] = value;
    else delete globalHeaders[key];
  },
};

export default api;
