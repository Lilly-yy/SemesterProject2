import { API_BASE_URL } from "./config.js";
import { fetchAuthJson } from "./http.js";
import { getAuth } from "../utils/storage.js";

export async function getWinsByProfile(name, { limit = 50, page = 1 } = {}) {
  const auth = getAuth();
  const accessToken = auth?.accessToken;

  if (!accessToken) throw new Error("Not logged in.");

  const url = new URL(`${API_BASE_URL}/auction/profiles/${name}/wins`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_bids", "true"); 

  const payload = await fetchAuthJson(url.toString(), accessToken);

  const listings = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta || null;

  return { listings, meta };
}
