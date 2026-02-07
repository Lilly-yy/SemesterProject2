import { fetchJson } from "./http.js";
import { API_BASE_URL } from "./config.js";

export async function getListingById(id) {
  if (!id) {
    throw new Error("Listing id is required.");
  }

  const url = `${API_BASE_URL}/auction/listings/${id}?_bids=true&_seller=true`;
  const payload = await fetchJson(url);

  return payload.data;
}
