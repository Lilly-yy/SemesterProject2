function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getFirstImage(media) {
  if (Array.isArray(media) && media[0] && typeof media[0].url === "string")
    return media[0].url;
  return "";
}

export function renderBidListings(gridEl, items) {
  gridEl.innerHTML = "";

  if (!items || items.length === 0) {
    gridEl.innerHTML = `<p class="text-brand">No bids yet.</p>`;
    return;
  }

  gridEl.innerHTML = items
    .map(({ listing, myMaxBid }) => {
      const title = listing?.title || "Untitled listing";
      const ends = formatDate(listing?.endsAt);
      const img = getFirstImage(listing?.media);
      const id = listing?.id;

      return `
        <article class="overflow-hidden rounded-lg bg-white shadow">
          <div class="h-40 w-full bg-slate-100">
            ${
              img
                ? `<img src="${img}" alt="${title}" class="h-40 w-full object-cover" loading="lazy" />`
                : `<div class="flex h-40 items-center justify-center text-slate-500 text-sm">No image</div>`
            }
          </div>

          <div class="p-4">
            <h3 class="text-lg font-semibold">${title}</h3>
            <p class="mt-1 text-sm text-brand">Ends: ${ends}</p>
            <p class="mt-2 font-semibold text-brand">Your max bid: ${myMaxBid} credits</p>

            ${
              id
                ? `<a href="listing.html?id=${encodeURIComponent(id)}"
                     class="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-brand hover:bg-accent-light">
                     View auction
                   </a>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}
