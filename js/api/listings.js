import { API_BASE_URL } from "./config.js";
import { fetchJson } from "./http.js";

export async function getListings({
  limit = 50,
  page = 1,
  q = "",
  activeOnly = false,
} = {}) {
  const url = new URL(`${API_BASE_URL}/auction/listings`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_bids", "true");

  if (activeOnly) url.searchParams.set("_active", "true");
  if (q) url.searchParams.set("q", q);

  const payload = await fetchJson(url.toString());

  const listings = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta || null;

  return { listings, meta };
}
