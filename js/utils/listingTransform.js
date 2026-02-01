import { parseDateMs, isActiveListing } from "./listingStatus.js";

export function getCurrentBid(listing) {
  const bids = Array.isArray(listing?.bids) ? listing.bids : [];
  let max = 0;

  for (const bid of bids) {
    const amount = Number(bid?.amount ?? 0);
    if (Number.isFinite(amount) && amount > max) max = amount;
  }

  return max;
}

export function decorateListing(listing, nowMs = Date.now()) {
  const endsAtMs = parseDateMs(listing?.endsAt);

  return {
    ...listing,
    active: isActiveListing(listing, nowMs),
    endsAtMs: endsAtMs ?? Number.POSITIVE_INFINITY,
    createdMs: parseDateMs(listing?.created) ?? 0,
    currentBid: getCurrentBid(listing),
  };
}

export function decorateListings(listings, nowMs = Date.now()) {
  return (Array.isArray(listings) ? listings : []).map((l) =>
    decorateListing(l, nowMs),
  );
}
