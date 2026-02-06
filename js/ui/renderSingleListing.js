import { isLoggedIn, getAuth, saveAuth } from "../utils/storage.js";
import { placeBid } from "../api/bids.js";
import { getProfile } from "../api/profile.js";
import { formatTimeLeft } from "../utils/time.js";

function formatEnds(endsAt) {
  if (!endsAt) return "—";
  const d = new Date(endsAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getHighestBid(bids = []) {
  if (!Array.isArray(bids) || bids.length === 0) return 0;
  return Math.max(...bids.map((b) => Number(b.amount || 0)));
}

function getMediaArray(listing) {
  const media = listing.media || listing.mediaUrls || listing.media_urls || [];

  if (Array.isArray(media) && typeof media[0] === "string") return media;
  if (Array.isArray(media) && media[0] && typeof media[0].url === "string") {
    return media.map((m) => m.url);
  }
  return [];
}

function isAuctionEnded(listing) {
  const endsAt = listing.endsAt || listing.deadline || listing.ends_at;
  const t = new Date(endsAt).getTime();
  if (!Number.isFinite(t)) return false;
  return t <= Date.now();
}

export async function renderSingleListing(listing) {
  const contentEl = document.getElementById("listingContent");
  const titleEl = document.getElementById("listingTitle");
  const mainImgEl = document.getElementById("listingMainImage");
  const thumbsEl = document.getElementById("listingThumbs");
  const endsEl = document.getElementById("listingEnds");
  const currentBidEl = document.getElementById("listingCurrentBid");
  const descEl = document.getElementById("listingDescription");
  const bidsEl = document.getElementById("bidsList");

  // Countdown + ended
  const timeLeftEl = document.getElementById("listingTimeLeft");
  const endedNoticeEl = document.getElementById("listingEndedNotice");

  const title = listing.title || "Untitled listing";
  const endsAtRaw = listing.endsAt || listing.deadline || listing.ends_at;
  const ends = formatEnds(endsAtRaw);

  const bids = Array.isArray(listing.bids) ? listing.bids : [];
  let highest = getHighestBid(bids);

  const media = getMediaArray(listing);

  // Auction status
  const ended = isAuctionEnded(listing);
  const timeLeftText = formatTimeLeft(endsAtRaw);

  // Basic render
  if (titleEl) titleEl.textContent = title;
  if (endsEl) endsEl.textContent = ends;
  if (currentBidEl) currentBidEl.textContent = String(highest);
  if (descEl)
    descEl.textContent = listing.description || "No description provided.";

  // countdown
  if (timeLeftEl) {
    timeLeftEl.textContent = ended ? "" : `( ${timeLeftText})`;
  }

  function setEndedState(isEnded) {
    if (!endedNoticeEl) return;

    if (isEnded) {
      endedNoticeEl.textContent = "Auction ended";
      endedNoticeEl.classList.remove("hidden");
      endedNoticeEl.removeAttribute("hidden");
    } else {
      endedNoticeEl.textContent = "";
      endedNoticeEl.classList.add("hidden");
      endedNoticeEl.setAttribute("hidden", "");
    }
  }

  if (timeLeftEl) {
    timeLeftEl.classList.toggle("text-rose-700", ended);
    timeLeftEl.classList.toggle("font-semibold", ended);
  }

  setEndedState(ended);

  // Images
  const mainSrc = media[0] || "";
  if (mainSrc && mainImgEl) {
    mainImgEl.src = mainSrc;
    mainImgEl.alt = title;
  } else if (mainImgEl) {
    mainImgEl.removeAttribute("src");
    mainImgEl.alt = "No image";
    mainImgEl.className =
      "h-80 w-full bg-slate-100 flex items-center justify-center text-slate-500";
    mainImgEl.outerHTML = `<div id="listingMainImage" class="h-80 w-full bg-slate-100 flex items-center justify-center text-slate-500">No image</div>`;
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = "";
    if (media.length > 1) {
      thumbsEl.innerHTML = media
        .slice(0, 6)
        .map(
          (src, i) => `
          <button data-src="${src}" class="h-16 w-16 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 hover:ring-accent">
            <img src="${src}" alt="${title} thumbnail ${i + 1}" class="h-full w-full object-cover" loading="lazy" />
          </button>
        `,
        )
        .join("");

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
  }

  // Bids list
  function renderBids() {
    if (!bidsEl) return;
    bidsEl.innerHTML = "";

    if (bids.length === 0) {
      bidsEl.innerHTML = `<div class="p-4 text-brand">No bids yet.</div>`;
      return;
    }

    const rows = [...bids]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .map((b) => {
        const name = b.bidderName || b.bidder?.name || "Unknown";
        const amount = Number(b.amount || 0);

        return `
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span class="font-medium text-slate-800">${name}</span>
            <span class="font-semibold text-brand">${amount} credits</span>
          </div>
        `;
      });

    bidsEl.innerHTML = rows.join("");
  }

  renderBids();

  // Toggle login/bid UI
  const loginBox = document.getElementById("loginToBidBox");
  const bidForm = document.getElementById("bidForm");
  const bidAmountInput = document.getElementById("bidAmount");
  const bidStatus = document.getElementById("bidStatus");
  const creditsInfo = document.getElementById("creditsInfo");
  const auth = getAuth();

  // If ended -> hide bidding
  if (ended) {
    setEndedState(true);

    loginBox?.classList.add("hidden");
    bidForm?.classList.add("hidden");

    contentEl?.classList.remove("hidden");
    return;
  }

  setEndedState(false);

  loginBox?.classList.toggle("hidden", isLoggedIn());
  bidForm?.classList.toggle("hidden", !isLoggedIn());

  // Not ended -> normal login/bid visibility
  if (loginBox) {
    loginBox.classList.toggle("hidden", isLoggedIn());
  }
  if (bidForm) {
    bidForm.classList.toggle("hidden", !isLoggedIn());
  }

  // Load credits if logged in
  let credits = null;

  if (isLoggedIn() && auth?.accessToken && auth?.name) {
    try {
      const profile = await getProfile(auth.name, auth.accessToken);
      credits = Number(profile?.credits ?? 0);

      if (creditsInfo) {
        creditsInfo.textContent = `Available credits: ${credits}`;
      }

      saveAuth({ ...auth, credits });
    } catch {
      if (creditsInfo) {
        creditsInfo.textContent = "Could not load credits.";
      }
    }
  }

  // Bind bid submit once
  if (bidForm && bidAmountInput && bidStatus && auth?.accessToken) {
    if (!bidForm.dataset.bound) {
      bidForm.dataset.bound = "true";

      bidForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const amount = Number(bidAmountInput.value);

        if (!Number.isFinite(amount) || amount <= 0) {
          bidStatus.textContent = "Please enter a valid bid amount.";
          return;
        }

        if (amount <= highest) {
          bidStatus.textContent = `Your bid must be higher than the current bid (${highest} credits).`;
          return;
        }

        // Credits validation
        if (credits !== null && amount > credits) {
          bidStatus.textContent = `You don't have enough credits. Available: ${credits}.`;
          return;
        }

        try {
          bidStatus.textContent = "Placing bid…";

          await placeBid({
            listingId: listing.id,
            amount,
            accessToken: auth.accessToken,
          });

          bidStatus.textContent = "Bid placed!";

          // Update UI without reload
          bids.push({
            amount,
            bidderName: auth.name || "You",
          });

          highest = getHighestBid(bids);
          if (currentBidEl) currentBidEl.textContent = String(highest);
          renderBids();

          bidAmountInput.value = "";

          // Refresh credits from API
          if (auth?.name) {
            const profile = await getProfile(auth.name, auth.accessToken);
            credits = Number(profile?.credits ?? credits);

            if (creditsInfo && credits !== null) {
              creditsInfo.textContent = `Available credits: ${credits}`;
            }

            saveAuth({ ...getAuth(), credits });
          }
        } catch (err) {
          bidStatus.textContent = `Bid failed: ${err.message}`;
        }
      });
    }
  }

  contentEl?.classList.remove("hidden");
}
