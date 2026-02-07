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
  if (Array.isArray(media) && media[0] && typeof media[0].url === "string") {
    return media[0].url;
  }
  return "";
}

export function renderBidListings(gridEl, items) {
  if (!gridEl) return;
  gridEl.replaceChildren();

  if (!Array.isArray(items) || items.length === 0) {
    const p = document.createElement("p");
    p.className = "text-brand";
    p.textContent = "No bids yet.";
    gridEl.append(p);
    return;
  }

  for (const { listing, myMaxBid } of items) {
    const title = listing?.title || "Untitled listing";
    const ends = formatDate(listing?.endsAt);
    const imgSrc = getFirstImage(listing?.media);
    const id = listing?.id;

    const article = document.createElement("article");
    article.className = "overflow-hidden rounded-lg bg-white shadow";

    // Media
    const mediaWrap = document.createElement("div");
    mediaWrap.className = "h-40 w-full bg-slate-100";

    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = title;
      img.loading = "lazy";
      img.className = "h-40 w-full object-cover";
      mediaWrap.append(img);
    } else {
      const noImg = document.createElement("div");
      noImg.className =
        "flex h-40 items-center justify-center text-slate-500 text-sm";
      noImg.textContent = "No image";
      mediaWrap.append(noImg);
    }

    // Content
    const content = document.createElement("div");
    content.className = "p-4";

    const h3 = document.createElement("h3");
    h3.className = "text-lg font-semibold";
    h3.textContent = title;

    const endsP = document.createElement("p");
    endsP.className = "mt-1 text-sm text-brand";
    endsP.textContent = `Ends: ${ends}`;

    const bidP = document.createElement("p");
    bidP.className = "mt-2 font-semibold text-brand";
    bidP.textContent = `Your max bid: ${myMaxBid} credits`;

    content.append(h3, endsP, bidP);

    if (id) {
      const link = document.createElement("a");
      link.href = `listing.html?id=${encodeURIComponent(id)}`;
      link.className =
        "mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-brand hover:bg-accent-light";
      link.textContent = "View auction";
      content.append(link);
    }

    article.append(mediaWrap, content);
    gridEl.append(article);
  }
}
