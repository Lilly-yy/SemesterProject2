import { API_BASE_URL } from "./config.js";
import { fetchAuthJson } from "./http.js";

export async function placeBid({ listingId, amount, accessToken }) {
  const url = `${API_BASE_URL}/auction/listings/${listingId}/bids`;

  const payload = await fetchAuthJson(url, accessToken, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  return payload.data;
}
