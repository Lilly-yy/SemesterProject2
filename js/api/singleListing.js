import { fetchJson } from "./http.js";

const BASE_URLS = [
  "https://api.noroff.dev/api/v2/auction",
  "https://v2.api.noroff.dev/auction",
  "https://api.noroff.dev/api/v1/auction",
];

function buildUrl(base, path, params = {}) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

function normalizeOne(payload) {
  if (payload && payload.data) return payload.data;
  return payload;
}

export async function getListingById(id) {
  let lastError = null;

  for (const base of BASE_URLS) {
    try {
    
      const url = buildUrl(base, `/listings/${id}`, { _bids: true });
      const payload = await fetchJson(url);
      return { baseUsed: base, listing: normalizeOne(payload) };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Could not load listing.");
}
