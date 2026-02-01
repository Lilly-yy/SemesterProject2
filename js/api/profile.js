import { API_BASE_URL } from "./config.js";
import { fetchAuthJson } from "./http.js";

export async function getProfile(name, accessToken) {
  const url = `${API_BASE_URL}/auction/profiles/${name}`;
  const payload = await fetchAuthJson(url, accessToken);
  return payload.data;
}

export async function updateAvatar({ name, accessToken, avatar }) {
  const url = `${API_BASE_URL}/auction/profiles/${name}`;
  const payload = await fetchAuthJson(url, accessToken, {
    method: "PUT",
    body: JSON.stringify({ avatar }),
  });
  return payload.data;
}
