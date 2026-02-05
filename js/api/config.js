export const API_BASE_URL =
  import.meta.env.VITE_NOROFF_API_BASE || "https://v2.api.noroff.dev";

export const API_KEY = import.meta.env.VITE_NOROFF_API_KEY;

if (!API_KEY) {
  console.warn(
    "Missing VITE_NOROFF_API_KEY. Add it to .env (local) or Netlify environment variables."
  );
}

export function getAuthHeaders(extraHeaders = {}) {
  return {
    "Content-Type": "application/json",
    "X-Noroff-API-Key": API_KEY,
    ...extraHeaders,
  };
}