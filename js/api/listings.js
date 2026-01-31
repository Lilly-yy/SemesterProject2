import { fetchJson } from "./http.js";

const BASE_URLS = [
  "https://api.noroff.dev/api/v2/auction", 
  "https://v2.api.noroff.dev/auction",    
  "https://api.noroff.dev/api/v1/auction", 
];

function buildUrl(base, path, params = {}) {
  const url = new URL(base + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function normalizeListings(payload) {

  if (payload && Array.isArray(payload.data)) return payload.data;

  if (Array.isArray(payload)) return payload;
  return [];
}


export async function getListings({ limit = 12, sort = "created", sortOrder = "desc", q = "" } = {}) {
  let lastError = null;

  for (const base of BASE_URLS) {
    try {

      const url = buildUrl(base, "/listings", {
        limit,
        sort,
        sortOrder,
        q, 
      });

      const payload = await fetchJson(url);
      const listings = normalizeListings(payload);

      
      return { baseUsed: base, listings };
    } catch (err) {
      lastError = err;
     
    }
  }

  throw lastError || new Error("Could not fetch listings from any known API base URL.");
}
