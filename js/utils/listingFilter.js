export function filterListings(listings, { activeOnly } = {}) {
  const arr = Array.isArray(listings) ? listings : [];
  if (!activeOnly) return arr;
  return arr.filter((l) => l.active);
}
