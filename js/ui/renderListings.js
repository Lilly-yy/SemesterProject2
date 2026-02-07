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
  gridEl.replaceChildren();

  if (!Array.isArray(listings) || listings.length === 0) {
    const p = document.createElement("p");
    p.className = "text-brand";
    p.textContent = "No listings found.";
    gridEl.append(p);
    return;
  }

  for (const l of listings) {
    const title = l?.title || "Untitled listing";
    const ends = formatEnds(l?.endsAt || l?.deadline || l?.ends_at);
    const highest = getHighestBid(l?.bids);
    const img = getFirstImage(l?.media || l?.mediaUrls || l?.media_urls);
    const id = l?.id || l?._id || "";

    const article = document.createElement("article");
    article.className = "overflow-hidden rounded-lg bg-white shadow";

    const mediaWrap = document.createElement("div");
    mediaWrap.className = "h-48 w-full bg-slate-100";

    if (img) {
      const image = document.createElement("img");
      image.src = img;
      image.alt = title;
      image.loading = "lazy";
      image.className = "h-48 w-full object-cover";
      mediaWrap.append(image);
    } else {
      const noImg = document.createElement("div");
      noImg.className =
        "flex h-48 items-center justify-center text-slate-500 text-sm";
      noImg.textContent = "No image";
      mediaWrap.append(noImg);
    }

    const content = document.createElement("div");
    content.className = "p-4";

    const h2 = document.createElement("h2");
    h2.className = "text-lg font-semibold";
    h2.textContent = title;

    const endsP = document.createElement("p");
    endsP.className = "mt-1 text-sm text-brand";
    endsP.textContent = `Ends: ${ends}`;

    const bidP = document.createElement("p");
    bidP.className = "mt-2 font-semibold text-brand";
    bidP.textContent = `Current bid: ${highest} credits`;

    const a = document.createElement("a");
    a.href = `listing.html?id=${encodeURIComponent(id)}`;
    a.className =
      "mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-brand hover:bg-accent-light";
    a.textContent = "View auction";

    content.append(h2, endsP, bidP, a);
    article.append(mediaWrap, content);
    gridEl.append(article);
  }
}
