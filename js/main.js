import { getAuth } from "./utils/storage.js";
import { initHeroBtn } from "./ui/heroBtn.js";
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
import { searchListingsAll } from "./api/searchListings.js";
import { initCreateListingPage } from "./ui/createListing.js";

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

function isCreatePage() {
  return document.body.dataset.page === "create";
}

async function loadHomeListings() {
  const statusEl = document.getElementById("listingsStatus");
  const gridEl = document.getElementById("listingsGrid");
  const countEl = document.getElementById("activeAuctionsCount");
  if (!statusEl || !gridEl) return;

  try {
    statusEl.textContent = "Loading listings…";

    const { listings, meta } = await getListings({
      limit: 50,
      activeOnly: true,
    });

    const decorated = decorateListings(listings);

    const filtered = filterListings(decorated, { activeOnly: true });

    const sorted = sortListingsUtil(filtered, "endingSoon");
    const top12 = sorted.slice(0, 12);

    if (countEl)
      countEl.textContent = String(meta?.totalCount ?? filtered.length);

    statusEl.textContent = "";
    renderListings(gridEl, top12);
  } catch (err) {
    statusEl.textContent = `Could not load listings: ${err.message}`;
    gridEl.innerHTML = "";
  }
}

async function loadBrowseListings() {
  const statusEl = document.getElementById("listingsStatus");
  const gridEl = document.getElementById("listingsGrid");
  const searchInput = document.getElementById("search");
  const searchForm = searchInput?.closest("form");

  const sortSelectEl = document.getElementById("sortSelect");
  const activeOnlyEl = document.getElementById("activeOnly");

  // Search elements
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  // Pagination elements
  const prevBtn = document.getElementById("pagePrev");
  const nextBtn = document.getElementById("pageNext");
  const pageInfoEl = document.getElementById("pageInfo");

  if (!statusEl || !gridEl) return;

  let page = 1;
  const limit = 15;

  function getQuery() {
    return (searchInput?.value || "").trim();
  }

  function updatePaginationUI(meta) {
    if (pageInfoEl && meta) {
      pageInfoEl.textContent = `Page ${meta.currentPage} of ${meta.pageCount} (${meta.totalCount} total)`;
    } else if (pageInfoEl) {
      pageInfoEl.textContent = "Page —";
    }

    if (prevBtn) prevBtn.disabled = Boolean(meta?.isFirstPage);
    if (nextBtn) nextBtn.disabled = Boolean(meta?.isLastPage);
  }

  // Disable pages when all search results shown on one page
  function disablePaginationForSearch(shownCount, totalCount) {
    if (pageInfoEl)
      pageInfoEl.textContent = `Showing ${shownCount} of ${totalCount}`;
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
  }

  async function run(query = "") {
    try {
      statusEl.textContent = "Loading listings…";

      const activeOnly = Boolean(activeOnlyEl?.checked);
      const trimmedQuery = String(query || "").trim();

      let listings = [];
      let meta = null;

      if (trimmedQuery) {
        // Fetch ALL search results across pages
        const res = await searchListingsAll({
          q: trimmedQuery,
          activeOnly,
          perPage: 50,
          maxItems: 300,
        });

        listings = res.listings;
      } else {
        // Normal paged browse
        const res = await getListings({ limit, page, activeOnly });
        listings = res.listings;
        meta = res.meta;
      }

      const decorated = decorateListings(listings);
      const filtered = filterListings(decorated, { activeOnly });

      const sortValue = sortSelectEl?.value || "endingSoon";
      const sorted = sortListingsUtil(filtered, sortValue);

      // Status + pages
      if (trimmedQuery) {
        statusEl.textContent = `Showing ${filtered.length}${
          activeOnly ? " active" : ""
        } of ${decorated.length} results for “${trimmedQuery}”.`;

        disablePaginationForSearch(filtered.length, decorated.length);
      } else {
        statusEl.textContent = "";
        updatePaginationUI(meta);
      }

      // Stats box
      const countEl = document.getElementById("activeAuctionsCount");
      if (countEl) {
        const activeCount = decorated.filter((l) => l.active).length;
        countEl.textContent = String(activeCount);
      }

      renderListings(gridEl, sorted);
    } catch (err) {
      statusEl.textContent = `Could not load listings: ${err.message}`;
      gridEl.innerHTML = "";
      updatePaginationUI(null);
    }
  }

  // Initial load
  if (searchInput) {
    searchInput.value = initialQuery;
  }
  await run(initialQuery);

  // Search submit -> reset to page 1
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      page = 1;
      run(getQuery());
    });
  }

  // Sort/filter change -> reset to page 1
  function rerunCurrent() {
    page = 1;
    run(getQuery());
  }

  sortSelectEl?.addEventListener("change", rerunCurrent);
  activeOnlyEl?.addEventListener("change", rerunCurrent);

  // Clicking the X (or clearing input) should reset results
  if (searchInput) {
    const handleMaybeCleared = () => {
      if (getQuery() === "") {
        page = 1;
        run("");
      }
    };

    searchInput.addEventListener("input", handleMaybeCleared);
    searchInput.addEventListener("search", handleMaybeCleared);
  }

  // Prev/Next
  prevBtn?.addEventListener("click", () => {
    if (page > 1) page -= 1;
    run(getQuery());
  });

  nextBtn?.addEventListener("click", () => {
    page += 1;
    run(getQuery());
  });
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
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initHeader();

  if (isHomePage()) {
    initHeroBtn();
    loadHomeListings();
  }

  if (isBrowsePage()) loadBrowseListings();
  if (isListingPage()) loadSingleListing();
  if (isLoginPage()) initLoginForm();
  if (isRegisterPage()) initRegisterForm();
  if (isProfilePage()) initProfilePage();
  if (isCreatePage()) initCreateListingPage();
});
