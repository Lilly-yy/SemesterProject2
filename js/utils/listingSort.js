function compareActiveFirst(a, b) {
  if (a.active === b.active) return 0;
  return a.active ? -1 : 1;
}

export function sortListings(listings, sortValue) {
  const arr = [...(Array.isArray(listings) ? listings : [])];

  const key = String(sortValue || "endingSoon").toLowerCase();

  return arr.sort((a, b) => {
    const activeCmp = compareActiveFirst(a, b);
    if (activeCmp !== 0) return activeCmp;
    switch (key) {
      case "endingsoon":
      case "ending_soon":
        return (a.endsAtMs ?? Infinity) - (b.endsAtMs ?? Infinity);

      case "newest":
        return (b.createdMs ?? 0) - (a.createdMs ?? 0);

      case "pricehigh":
      case "price_high":
        return (b.currentBid ?? 0) - (a.currentBid ?? 0);

      case "pricelow":
      case "price_low":
        return (a.currentBid ?? 0) - (b.currentBid ?? 0);

      default:
        return 0;
    }
  });
}
