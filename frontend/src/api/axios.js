// src/api/axios.js

// Ensure this is your BACKEND Render URL, not the frontend one!
let baseURL = "https://api.flora-x.pages.dev/api";

const defaultHeaders = { "Content-Type": "application/json" };
let globalHeaders = {};

const storedToken = localStorage.getItem("token");
if (storedToken) {
    globalHeaders["Authorization"] = `Bearer ${storedToken}`;
}

async function request(method, url, data = null, opts = {}) {
    const headers = { ...defaultHeaders, ...globalHeaders, ...(opts.headers || {}) };
    
    // Logic to handle file uploads (FormData) automatically
    if (data instanceof FormData) {
        delete headers["Content-Type"];
    }

    const cleanBase = baseURL.replace(/\/$/, "");
    const cleanUrl = url.replace(/^\//, "");
    const finalURL = `${cleanBase}/${cleanUrl}`;

    const resp = await fetch(finalURL, {
        method,
        headers,
        body: data instanceof FormData ? data : (data ? JSON.stringify(data) : null),
        ...opts
    });

    const parsed = await resp.json().catch(() => null);

    if (!resp.ok) {
        const error = new Error(parsed?.error || "Request failed");
        error.response = { data: parsed, status: resp.status };
        throw error;
    }

    return { data: parsed };
}

const api = {
    post: (url, data) => request("POST", url, data),
    get: (url) => request("GET", url),
    put: (url, data) => request("PUT", url, data),
    delete: (url) => request("DELETE", url),
    setAuthToken: (token) => {
        if (!token) {
            delete globalHeaders["Authorization"];
            localStorage.removeItem("token");
            return;
        }
        globalHeaders["Authorization"] = `Bearer ${token}`;
        try { localStorage.setItem("token", token); } catch (e) {}
    }
};

export default api;