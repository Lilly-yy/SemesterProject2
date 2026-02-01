import { API_KEY } from "./config.js";

export async function fetchJson(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(API_KEY ? { "X-Noroff-API-Key": API_KEY } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      payload?.errors?.[0]?.message ||
      payload?.message ||
      `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function fetchAuthJson(url, accessToken, options = {}) {
  return fetchJson(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });
}
