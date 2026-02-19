// src/api/axios.js

// ✅ Backend base URL (Render) + /api
const baseURL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://flowerdeliveryapp-aid0.onrender.com/api";

const defaultHeaders = {
  "Content-Type": "application/json",
};

let globalHeaders = {};

// Load stored token on app start
const storedToken = localStorage.getItem("token");
if (storedToken) {
  globalHeaders["Authorization"] = `Bearer ${storedToken}`;
}

/**
 * Core request handler
 */
async function request(method, url, data = null, options = {}) {
  const headers = {
    ...defaultHeaders,
    ...globalHeaders,
    ...(options.headers || {}),
  };

  // Remove content-type for FormData
  if (data instanceof FormData) {
    delete headers["Content-Type"];
  }

  const cleanBase = baseURL.replace(/\/$/, "");
  const cleanUrl = url.replace(/^\//, "");
  const finalURL = `${cleanBase}/${cleanUrl}`;

  try {
    const response = await fetch(finalURL, {
      method,
      headers,
      body:
        data instanceof FormData
          ? data
          : data
          ? JSON.stringify(data)
          : null,
      ...options,
    });

    const parsed = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        parsed?.error || parsed?.message || "Request failed"
      );

      error.response = {
        data: parsed,
        status: response.status,
      };

      throw error;
    }

    return { data: parsed };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

const api = {
  get: (url) => request("GET", url),
  post: (url, data) => request("POST", url, data),
  put: (url, data) => request("PUT", url, data),
  delete: (url) => request("DELETE", url),

  /**
   * Set or remove auth token
   */
  setAuthToken: (token) => {
    if (!token) {
      delete globalHeaders["Authorization"];
      localStorage.removeItem("token");
      return;
    }

    globalHeaders["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  },
};

export default api;