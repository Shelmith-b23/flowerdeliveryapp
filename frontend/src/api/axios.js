const rawBaseURL = process.env.REACT_APP_API_URL || "https://flowerdeliveryapp-aid0.onrender.com/api";
const baseURL = rawBaseURL.replace(/['"]+/g, '').replace(/\/$/, "");

async function request(method, endpoint, data = null) {
  const cleanEndpoint = endpoint.replace(/^\//, "");
  const finalURL = `${baseURL}/${cleanEndpoint}`;
  const token = localStorage.getItem("token");

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token.replace(/['"]+/g, '')}`; 
  }

  const config = {
    method: method.toUpperCase(),
    headers: headers,
    body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : null
  };
  
  if (data instanceof FormData) delete config.headers["Content-Type"];

  try {
    const response = await fetch(finalURL, config);
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error = new Error(parsed.error || `API Error: ${response.status}`);
      error.response = { status: response.status, data: parsed };
      throw error;
    }

    return { data: parsed };
  } catch (error) { throw error; }
}

const api = {
  get: (endpoint) => request("GET", endpoint),
  post: (endpoint, data) => request("POST", endpoint, data),
  setAuthToken: (token) => token ? localStorage.setItem("token", token) : localStorage.removeItem("token")
};

export default api;