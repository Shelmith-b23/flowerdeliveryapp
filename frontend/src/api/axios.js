// src/api/axios.js

const rawBaseURL = process.env.REACT_APP_API_URL || "https://flowerdeliveryapp-aid0.onrender.com/api";
const baseURL = rawBaseURL.replace(/['"]+/g, '').replace(/\/$/, "");

async function request(method, endpoint, data = null) {
  const cleanEndpoint = endpoint.replace(/^\//, "");
  const finalURL = `${baseURL}/${cleanEndpoint}`;

  // ALWAYS get the latest token from localStorage right before the fetch
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token.replace(/['"]+/g, '')}`; 
  }

  const config = {
    method: method.toUpperCase(),
    headers: headers,
  };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
      // CRITICAL: Browsers MUST set the boundary for FormData themselves
      delete config.headers["Content-Type"];
    } else {
      config.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(finalURL, config);
    
    // Check for 401 specifically
    if (response.status === 401) {
      console.warn("Unauthorized! Clearing token...");
      localStorage.removeItem("token");
      // Optional: window.location.href = "/login";
    }

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error = new Error(parsed.error || `API Error: ${response.status}`);
      error.response = { status: response.status, data: parsed };
      throw error;
    }

    return { data: parsed };
  } catch (error) {
    throw error;
  }
}

const api = {
  get: (endpoint) => request("GET", endpoint),
  post: (endpoint, data) => request("POST", endpoint, data),
  put: (endpoint, data) => request("PUT", endpoint, data),    // Added PUT
  delete: (endpoint) => request("DELETE", endpoint),         // Added DELETE
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }
};

export default api;