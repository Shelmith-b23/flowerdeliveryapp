// src/api/axios.js

let baseURL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://flowerdeliveryapp-aid0.onrender.com/api";

const defaultHeaders = { "Content-Type": "application/json" };
let globalHeaders = {};

// On initial load, attach token from localStorage if it exists
const storedToken = localStorage.getItem("token");
if (storedToken) {
  globalHeaders["Authorization"] = `Bearer ${storedToken}`;
}

async function request(method, url, data = null, opts = {}) {
  const headers = { ...defaultHeaders, ...globalHeaders, ...(opts.headers || {}) };
  const fetchOpts = { method, headers };

  if (data instanceof FormData) {
    delete headers["Content-Type"];
    fetchOpts.body = data;
  } else if (data != null && method !== "GET") {
    fetchOpts.body = JSON.stringify(data);
  }

  if (opts.withCredentials) fetchOpts.credentials = "include";

  const cleanBase = baseURL.replace(/\/$/, "");
  const cleanUrl = url.replace(/^\//, "");
  const finalURL = `${cleanBase}/${cleanUrl}`;

  let resp;
  try {
    resp = await fetch(finalURL, fetchOpts);
  } catch (err) {
    throw new Error(
      `Network error: Could not reach ${finalURL}. Check server or CORS.`
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
      (parsed && (parsed.message || parsed.error)) || `Request failed with status ${resp.status}`
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

  setBaseURL: (newBaseURL) => {
    if (newBaseURL) baseURL = newBaseURL.replace(/\/$/, "");
  },

  setAuthToken: (token) => {
    if (token) {
      globalHeaders["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token); // also save token
    } else {
      delete globalHeaders["Authorization"];
      localStorage.removeItem("token");
    }
  },

  logout: () => {
    delete globalHeaders["Authorization"];
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  setGlobalHeader: (key, value) => {
    if (value) globalHeaders[key] = value;
    else delete globalHeaders[key];
  },
};

export default api;
