import { API_BASE_URL } from "./config.js";
import { fetchAuthJson } from "./http.js";
import { getAuth } from "../utils/storage.js";

export async function getBidsByProfile(name, { limit = 100, page = 1 } = {}) {
  const auth = getAuth();
  const accessToken = auth?.accessToken;

  if (!accessToken) throw new Error("Not logged in.");

  const url = new URL(`${API_BASE_URL}/auction/profiles/${name}/bids`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_listings", "true");

  const payload = await fetchAuthJson(url.toString(), accessToken);
  const bids = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta || null;

  return { bids, meta };
}
