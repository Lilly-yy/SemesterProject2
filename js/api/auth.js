import { API_BASE_URL } from "./config.js";
import { fetchJson } from "./http.js";

export async function registerUser({ name, email, password, bio, avatar, banner, venueManager }) {
  const payload = await fetchJson(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      bio,
      avatar,
      banner,
      venueManager,
    }),
  });

  return payload.data;
}

export async function loginUser({ email, password }) {
  const payload = await fetchJson(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return payload.data;
}
