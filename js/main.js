import { getListings } from "./api/listings.js";
import { renderListings } from "./ui/renderListings.js";
import { getListingById } from "./api/singleListing.js";
import { renderSingleListing } from "./ui/renderSingleListing.js";
import { initLoginForm, initRegisterForm } from "./ui/authForms.js";
import { initProfilePage } from "./ui/profile.js";
import { initHeader } from "./ui/header.js";
import { decorateListings } from "./utils/listingTransform.js";
import { filterListings } from "./utils/listingFilter.js";
import { sortListings as sortListingsUtil } from "./utils/listingSort.js";

const DEBUG = false;

function isHomePage() {
  return document.body.dataset.page === "home";
}

function isBrowsePage() {
  return document.body.dataset.page === "browse";
}

function isListingPage() {
  return document.body.dataset.page === "listing";
}

function isLoginPage() {
  return document.body.dataset.page === "login";
}

function isRegisterPage() {
  return document.body.dataset.page === "register";
}

function isProfilePage() {
  return document.body.dataset.page === "profile";
}

async function loadHomeListings() {
  const statusEl = document.getElementById("listingsStatus");
  const gridEl = document.getElementById("listingsGrid");
  if (!statusEl || !gridEl) return;

  try {
    statusEl.textContent = "Loading listings…";

    // Home: always active-only, ending soon, show top 12
    const { listings } = await getListings({ limit: 50, activeOnly: true });

    const decorated = decorateListings(listings);
    const filtered = filterListings(decorated, { activeOnly: true });
    const sorted = sortListingsUtil(filtered, "endingSoon");
    const top12 = sorted.slice(0, 12);

    // Stats: show total active auctions
    const countEl = document.getElementById("activeAuctionsCount");
    if (countEl) countEl.textContent = String(filtered.length);

    statusEl.textContent = "";
    renderListings(gridEl, top12);
  } catch (err) {
    statusEl.textContent = `Could not load listings: ${err.message}`;
    gridEl.innerHTML = "";
    if (DEBUG) console.error(err);
  }
}

async function loadBrowseListings() {
  const statusEl = document.getElementById("listingsStatus");
  const gridEl = document.getElementById("listingsGrid");
  const searchInput = document.getElementById("search");
  const searchForm = searchInput?.closest("form");

  const sortSelectEl = document.getElementById("sortSelect");
  const activeOnlyEl = document.getElementById("activeOnly");

  if (!statusEl || !gridEl) return;

  async function run(query = "") {
    try {
      statusEl.textContent = "Loading listings…";

      const activeOnly = Boolean(activeOnlyEl?.checked);

      // Browse: fetch based on controls
      const { listings } = await getListings({
        limit: 50,
        q: query,
        activeOnly,
      });

      const decorated = decorateListings(listings);
      const filtered = filterListings(decorated, { activeOnly });

      const sortValue = sortSelectEl?.value || "endingSoon";
      const sorted = sortListingsUtil(filtered, sortValue);

      // Stats: always show active count (label says "Active Auctions")
      const countEl = document.getElementById("activeAuctionsCount");
      if (countEl) {
        const activeCount = decorated.filter((l) => l.active).length;
        countEl.textContent = String(activeCount);
      }

      statusEl.textContent = "";
      renderListings(gridEl, sorted);
    } catch (err) {
      statusEl.textContent = `Could not load listings: ${err.message}`;
      gridEl.innerHTML = "";
      if (DEBUG) console.error(err);
    }
  }

  // Initial load
  await run("");

  // Search submit
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      run(searchInput.value.trim());
    });
  }

  function rerunCurrent() {
    run(searchInput?.value.trim() || "");
  }

  sortSelectEl?.addEventListener("change", rerunCurrent);
  activeOnlyEl?.addEventListener("change", rerunCurrent);
}

async function loadSingleListing() {
  const statusEl = document.getElementById("listingStatus");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!statusEl) return;

  if (!id) {
    statusEl.textContent = "Missing listing id in URL.";
    return;
  }

  try {
    statusEl.textContent = "Loading listing…";
    const listing = await getListingById(id);
    statusEl.textContent = "";
    renderSingleListing(listing);
  } catch (err) {
    statusEl.textContent = `Could not load listing: ${err.message}`;
    if (DEBUG) console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initHeader();

  if (isHomePage()) loadHomeListings();
  if (isBrowsePage()) loadBrowseListings();
  if (isListingPage()) loadSingleListing();
  if (isLoginPage()) initLoginForm();
  if (isRegisterPage()) initRegisterForm();
  if (isProfilePage()) initProfilePage();
});
