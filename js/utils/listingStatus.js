export function parseDateMs(value) {
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function isActiveListing(listing, nowMs = Date.now()) {
  const endsAtMs = parseDateMs(listing?.endsAt);
  if (endsAtMs === null) return true;
  return endsAtMs > nowMs;
}
