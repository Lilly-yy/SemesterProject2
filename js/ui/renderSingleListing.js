function formatEnds(endsAt) {
  if (!endsAt) return "—";
  const d = new Date(endsAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function getHighestBid(bids = []) {
  if (!Array.isArray(bids) || bids.length === 0) return 0;
  return Math.max(...bids.map((b) => Number(b.amount || 0)));
}

function getMediaArray(listing) {
  const media = listing.media || listing.mediaUrls || listing.media_urls || [];
 
  if (Array.isArray(media) && typeof media[0] === "string") return media;
  if (Array.isArray(media) && media[0] && typeof media[0].url === "string") return media.map(m => m.url);
  return [];
}

export function renderSingleListing(listing) {
  const contentEl = document.getElementById("listingContent");
  const titleEl = document.getElementById("listingTitle");
  const mainImgEl = document.getElementById("listingMainImage");
  const thumbsEl = document.getElementById("listingThumbs");
  const endsEl = document.getElementById("listingEnds");
  const currentBidEl = document.getElementById("listingCurrentBid");
  const descEl = document.getElementById("listingDescription");
  const bidsEl = document.getElementById("bidsList");

  const title = listing.title || "Untitled listing";
  const ends = formatEnds(listing.endsAt || listing.deadline || listing.ends_at);
  const bids = Array.isArray(listing.bids) ? listing.bids : [];
  const highest = getHighestBid(bids);
  const media = getMediaArray(listing);

  titleEl.textContent = title;
  endsEl.textContent = ends;
  currentBidEl.textContent = String(highest);
  descEl.textContent = listing.description || "No description provided.";

  // Images
  const mainSrc = media[0] || "";
  if (mainSrc) {
    mainImgEl.src = mainSrc;
    mainImgEl.alt = title;
  } else {
    // fallback “no image”
    mainImgEl.removeAttribute("src");
    mainImgEl.alt = "No image";
    mainImgEl.className = "h-80 w-full bg-slate-100 flex items-center justify-center text-slate-500";
    mainImgEl.outerHTML = `<div id="listingMainImage" class="h-80 w-full bg-slate-100 flex items-center justify-center text-slate-500">No image</div>`;
  }

  thumbsEl.innerHTML = "";
  if (media.length > 1) {
    thumbsEl.innerHTML = media
      .slice(0, 6)
      .map((src, i) => `
        <button data-src="${src}" class="h-16 w-16 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 hover:ring-amber-400">
          <img src="${src}" alt="${title} thumbnail ${i + 1}" class="h-full w-full object-cover" loading="lazy" />
        </button>
      `)
      .join("");

    // thumbnail click => swap main image
    thumbsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-src]");
      if (!btn) return;
      const src = btn.getAttribute("data-src");
      const main = document.getElementById("listingMainImage");
      if (main && main.tagName === "IMG") {
        main.src = src;
      }
    });
  }

  // Bids list
  bidsEl.innerHTML = "";

  if (bids.length === 0) {
    bidsEl.innerHTML = `<div class="p-4 text-slate-600">No bids yet.</div>`;
  } else {
    const rows = [...bids]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .map((b) => {
        const name = b.bidderName || b.bidder?.name || "Unknown";
        const amount = Number(b.amount || 0);
        return `
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span class="font-medium text-slate-800">${name}</span>
            <span class="font-semibold text-emerald-900">${amount} credits</span>
          </div>
        `;
      });

    bidsEl.innerHTML = rows.join("");
  }

  contentEl.classList.remove("hidden");
}
