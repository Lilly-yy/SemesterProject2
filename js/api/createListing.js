import { API_BASE_URL } from "./config.js";
import { fetchAuthJson } from "./http.js";
import { getAuth } from "../utils/storage.js";

export async function createListing({
  title,
  description,
  tags,
  media,
  endsAt,
}) {
  const auth = getAuth();
  const accessToken = auth?.accessToken;

  if (!accessToken) {
    throw new Error("You must be logged in to create a listing.");
  }

  const url = `${API_BASE_URL}/auction/listings`;

  const body = {
    title,
    endsAt,
  };

  if (description) body.description = description;
  if (Array.isArray(tags) && tags.length) body.tags = tags;
  if (Array.isArray(media) && media.length) body.media = media;

  return fetchAuthJson(url, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
