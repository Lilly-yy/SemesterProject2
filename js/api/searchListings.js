import { API_BASE_URL } from "./config.js";
import { fetchJson } from "./http.js";

export async function searchListings({
  q,
  limit = 50,
  activeOnly = false,
} = {}) {
  const url = new URL(`${API_BASE_URL}/auction/listings/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("_bids", "true");

  if (activeOnly) url.searchParams.set("_active", "true");

  const payload = await fetchJson(url.toString());
  const listings = Array.isArray(payload?.data) ? payload.data : [];
  return { listings };
}
