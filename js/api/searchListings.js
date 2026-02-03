import { API_BASE_URL } from "./config.js";
import { fetchJson } from "./http.js";

export async function searchListings({ q, limit = 50, page = 1, activeOnly = false } = {}) {
  const url = new URL(`${API_BASE_URL}/auction/listings/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_bids", "true");
  if (activeOnly) url.searchParams.set("_active", "true");

  const payload = await fetchJson(url.toString());
  const listings = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta || null;

  return { listings, meta };
}

export async function searchListingsAll({
  q,
  activeOnly = false,
  perPage = 50,
  maxItems = 300,
} = {}) {
  let page = 1;
  let all = [];
  let meta = null;

  while (all.length < maxItems) {
    const res = await searchListings({ q, limit: perPage, page, activeOnly });
    meta = res.meta;
    all = all.concat(res.listings);

    if (!meta || meta.isLastPage) break;
    page += 1;
  }

  return { listings: all.slice(0, maxItems), meta, truncated: all.length > maxItems };
}

