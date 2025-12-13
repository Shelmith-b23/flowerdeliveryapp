// Replaced axios with a lightweight fetch wrapper so we don't need the axios dependency
// The rest of the app imports `../api/axios` as `api` and uses `api.get/post/put/delete`.
let baseURL = "http://localhost:5000/api";

const defaultHeaders = { "Content-Type": "application/json" };
let globalHeaders = {};

async function request(method, url, data = null, opts = {}) {
	const headers = { ...defaultHeaders, ...globalHeaders, ...(opts.headers || {}) };
	const fetchOpts = { method, headers };
	if (data != null && method !== "GET") fetchOpts.body = JSON.stringify(data);
	if (opts.withCredentials) fetchOpts.credentials = "include";

	const resp = await fetch(baseURL + url, fetchOpts);
	const contentType = resp.headers.get("content-type") || "";
	let parsed = null;
	try {
		if (contentType.includes("application/json")) parsed = await resp.json();
		else parsed = await resp.text();
	} catch (err) {
		// If parsing fails, leave parsed as null
	}

	const axiosLikeResponse = { data: parsed, status: resp.status, ok: resp.ok, headers: resp.headers };
	if (!resp.ok) {
		const error = new Error((parsed && parsed.message) || `Request failed with status ${resp.status}`);
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
	setBaseURL: (newBaseURL) => { if (newBaseURL) baseURL = newBaseURL; },
	setAuthToken: (token) => { if (token) globalHeaders['Authorization'] = `Bearer ${token}`; else delete globalHeaders['Authorization']; },
	setGlobalHeader: (key, value) => { if (value) globalHeaders[key] = value; else delete globalHeaders[key]; }
};

export default api;
