// src/api/axios.js

// 1. Get the URL and strip any accidental double quotes or trailing slashes
const rawBaseURL = process.env.REACT_APP_API_URL || "https://flowerdeliveryapp-aid0.onrender.com/api";
const baseURL = rawBaseURL.replace(/['"]+/g, '').replace(/\/$/, "");

let globalHeaders = {
  "Content-Type": "application/json",
};

// Load token from storage on boot
const token = localStorage.getItem("token");
if (token) {
  globalHeaders["Authorization"] = `Bearer ${token}`;
}

async function request(method, endpoint, data = null) {
  // Ensure the endpoint doesn't have a leading slash
  const cleanEndpoint = endpoint.replace(/^\//, "");
  const finalURL = `${baseURL}/${cleanEndpoint}`;

  const config = {
    method: method.toUpperCase(),
    headers: { ...globalHeaders },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(finalURL, config);
    
    // Handle empty responses
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error = new Error(parsed.error || "API Request Failed");
      error.response = { status: response.status, data: parsed };
      throw error;
    }

    return { data: parsed };
  } catch (error) {
    console.error(`Fetch Error [${method}] ${finalURL}:`, error);
    throw error;
  }
}

const api = {
  post: (endpoint, data) => request("POST", endpoint, data),
  get: (endpoint) => request("GET", endpoint),
  setAuthToken: (token) => {
    if (token) {
      globalHeaders["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete globalHeaders["Authorization"];
      localStorage.removeItem("token");
    }
  }
};

export default api;