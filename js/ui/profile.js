import { getAuth, clearAuth, saveAuth } from "../utils/storage.js";
import { getProfile, updateAvatar } from "../api/profile.js";

import { getListingsByProfile } from "../api/profileListings.js";
import { getBidsByProfile } from "../api/profileBids.js";

import { renderListings } from "./renderListings.js";
import { renderBidListings } from "./renderProfileBids.js";

import { decorateListings } from "../utils/listingTransform.js";
import { sortListings as sortListingsUtil } from "../utils/listingSort.js";

import { getWinsByProfile } from "../api/profileWins.js";

function setText(el, text) {
  if (el) el.textContent = text;
}

async function loadMyWins(profileName) {
  const statusEl = document.getElementById("winsStatus");
  const gridEl = document.getElementById("winsGrid");
  if (!statusEl || !gridEl) return;

  try {
    statusEl.textContent = "Loading wins…";

    const { listings } = await getWinsByProfile(profileName, {
      limit: 50,
      page: 1,
    });

    if (!listings.length) {
      statusEl.textContent = "No wins yet.";
      gridEl.innerHTML = "";
      return;
    }

    const decorated = decorateListings(listings);

    const sorted = sortListingsUtil(decorated, "newest");

    statusEl.textContent = "";
    renderListings(gridEl, sorted);
  } catch (err) {
    statusEl.textContent = `Could not load wins: ${err.message}`;
    gridEl.innerHTML = "";
  }
}


async function loadMyListings(profileName) {
  const statusEl = document.getElementById("myListingsStatus");
  const gridEl = document.getElementById("myListingsGrid");
  if (!statusEl || !gridEl) return;

  try {
    setText(statusEl, "Loading your auctions…");

    const { listings } = await getListingsByProfile(profileName, {
      limit: 50,
      page: 1,
    });

    if (!listings.length) {
      setText(statusEl, "You haven’t created any auctions yet.");
      gridEl.innerHTML = "";
      return;
    }

    const decorated = decorateListings(listings);
    const sorted = sortListingsUtil(decorated, "newest");

    setText(statusEl, "");
    renderListings(gridEl, sorted);
  } catch (err) {
    setText(statusEl, `Could not load your auctions: ${err.message}`);
    gridEl.innerHTML = "";
  }
}


function buildUniqueBidListings(bids = []) {
  // Builds a unique list of listings you've bid on, keeping your highest bid per listing
  const map = new Map();

  for (const b of bids) {
    const listing = b?.listing;
    const listingId = listing?.id;
    if (!listingId) continue;

    const amount = Number(b?.amount || 0);
    const existing = map.get(listingId);

    if (!existing || amount > existing.myMaxBid) {
      map.set(listingId, { listing, myMaxBid: amount });
    }
  }

  return Array.from(map.values());
}

async function loadMyBidListings(profileName) {
  const statusEl = document.getElementById("myBidsStatus");
  const gridEl = document.getElementById("myBidsGrid");
  if (!statusEl || !gridEl) return;

  try {
    setText(statusEl, "Loading your bids…");

    const { bids } = await getBidsByProfile(profileName, {
      limit: 100,
      page: 1,
    });

    const unique = buildUniqueBidListings(bids);

    // Sort by endingSoon using the same decorate/sort logic (based on listing.endsAt)
    const listingOnly = unique.map((x) => x.listing);
    const decorated = decorateListings(listingOnly);
    const sortedListings = sortListingsUtil(decorated, "endingSoon");

    const order = new Map(sortedListings.map((l, idx) => [l.id, idx]));
    unique.sort((a, b) => (order.get(a.listing.id) ?? 99999) - (order.get(b.listing.id) ?? 99999));

    setText(statusEl, "");
    renderBidListings(gridEl, unique);
  } catch (err) {
    setText(statusEl, `Could not load your bids: ${err.message}`);
    gridEl.innerHTML = "";
  }
}

export async function initProfilePage() {
  const statusEl = document.getElementById("profileStatus");
  const cardEl = document.getElementById("profileCard");

  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");
  const creditsEl = document.getElementById("profileCredits");
  const avatarEl = document.getElementById("profileAvatar");

  const logoutBtn = document.getElementById("logoutBtn");

  const avatarForm = document.getElementById("avatarForm");
  const avatarUrlInput = document.getElementById("avatarUrl");
  const avatarAltInput = document.getElementById("avatarAlt");
  const avatarStatusEl = document.getElementById("avatarStatus");

  const auth = getAuth();

  if (!auth?.accessToken || !auth?.name) {
    setText(statusEl, "You must be logged in to view your profile.");
    window.location.href = "login.html";
    return;
  }

  try {
    setText(statusEl, "Loading profile…");

    const profile = await getProfile(auth.name, auth.accessToken);

    setText(nameEl, profile.name || auth.name);
    setText(emailEl, profile.email || auth.email || "");
    setText(creditsEl, String(profile.credits ?? 0));

    const avatarUrl = profile.avatar?.url || "";
    if (avatarEl) {
      avatarEl.src = avatarUrl || "assets/icons/logo.png";
      avatarEl.alt = profile.avatar?.alt || "User avatar";
    }

    saveAuth({ ...auth, credits: profile.credits });

    setText(statusEl, "");
    if (cardEl) cardEl.classList.remove("hidden");

    // Load auctions
    await loadMyWins(profile.name || auth.name);
    await loadMyListings(profile.name || auth.name);
    await loadMyBidListings(profile.name || auth.name);
    
  } catch (err) {
    setText(statusEl, `Could not load profile: ${err.message}`);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.href = "index.html";
    });
  }

  if (avatarForm && avatarUrlInput && avatarStatusEl) {
    avatarForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const url = avatarUrlInput.value.trim();
      const alt = avatarAltInput?.value.trim() || "";

      if (!url) {
        avatarStatusEl.textContent = "Please enter an avatar URL.";
        return;
      }

      try {
        avatarStatusEl.textContent = "Updating avatar…";

        const updated = await updateAvatar({
          name: auth.name,
          accessToken: auth.accessToken,
          avatar: { url, alt },
        });

        if (avatarEl) {
          avatarEl.src = updated.avatar?.url || url;
          avatarEl.alt = updated.avatar?.alt || alt || "User avatar";
        }

        avatarStatusEl.textContent = "Avatar updated!";
        avatarUrlInput.value = "";
        if (avatarAltInput) avatarAltInput.value = "";
      } catch (err) {
        avatarStatusEl.textContent = `Avatar update failed: ${err.message}`;
      }
    });
  }
}
