function formatEnds(endsAt) {
  if (!endsAt) return "—";
  const d = new Date(endsAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getHighestBid(bids = []) {
  if (!Array.isArray(bids) || bids.length === 0) return 0;
  return Math.max(...bids.map((b) => Number(b.amount || 0)));
}

function getFirstImage(media) {
  if (Array.isArray(media) && media.length > 0 && typeof media[0] === "string")
    return media[0];
  if (Array.isArray(media) && media[0] && typeof media[0].url === "string")
    return media[0].url;
  return "";
}

export function renderListings(gridEl, listings) {
  gridEl.innerHTML = "";

  if (!listings || listings.length === 0) {
    gridEl.innerHTML = `<p class="text-brand">No listings found.</p>`;
    return;
  }

  const cards = listings.map((l) => {
    const title = l.title || "Untitled listing";
    const ends = formatEnds(l.endsAt || l.deadline || l.ends_at);
    const highest = getHighestBid(l.bids);
    const img = getFirstImage(l.media || l.mediaUrls || l.media_urls);

    // Store id
    const id = l.id || l._id || "";

    return `
      <article class="overflow-hidden rounded-lg bg-white shadow">
        <div class="h-48 w-full bg-slate-100">
          ${
            img
              ? `<img src="${img}" alt="${title}" class="h-48 w-full object-cover" loading="lazy" />`
              : `<div class="flex h-48 items-center justify-center text-slate-500 text-sm">No image</div>`
          }
        </div>

        <div class="p-4">
          <h2 class="text-lg font-semibold">${title}</h2>
          <p class="mt-1 text-sm text-brand">Ends: ${ends}</p>
          <p class="mt-2 font-semibold text-brand">Current bid: ${highest} credits</p>

          <a
            href="listing.html?id=${encodeURIComponent(id)}"
            class="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-brand hover:bg-accent-light"
          >
            View auction
          </a>
        </div>
      </article>
    `;
  });

  gridEl.innerHTML = cards.join("");
}
