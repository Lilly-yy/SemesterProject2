import { fetchJson } from "./http.js";
import { API_BASE_URL } from "./config.js";

export async function getListingById(id) {
  const url = `${API_BASE_URL}/auction/listings/${id}?_bids=true&_seller=true`;
  const payload = await fetchJson(url);
  return payload.data;
}

const BASE_URLS = [
  "https://api.noroff.dev/api/v2/auction",
  "https://v2.api.noroff.dev/auction",
  "https://api.noroff.dev/api/v1/auction",
];

function buildUrl(base, path, params = {}) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "")
      url.searchParams.set(k, String(v));
  }
  return url.toString();
}

function normalizeOne(payload) {
  if (payload && payload.data) return payload.data;
  return payload;
}
