import { getListings } from "./api/listings.js";
import { renderListings } from "./ui/renderListings.js";
import { getListingById } from "./api/singleListing.js";
import { renderSingleListing } from "./ui/renderSingleListing.js";
import { initLoginForm, initRegisterForm } from "./ui/authForms.js";

const DEBUG = false;
function isHomePage() {
  return document.body.dataset.page === "home";
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

async function loadHomeListings() {
  const statusEl = document.getElementById("listingsStatus");
  const gridEl = document.getElementById("listingsGrid");
  const searchInput = document.getElementById("search");
  const searchForm = searchInput?.closest("form");

  if (!statusEl || !gridEl) return;

  async function run(query = "") {
    try {
      statusEl.textContent = "Loading listings…";

      const { listings } = await getListings({ limit: 12, q: query });

      const countEl = document.getElementById("activeAuctionsCount");
      if (countEl) countEl.textContent = String(listings.length);

      statusEl.textContent = "";
      renderListings(gridEl, listings);
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
    const { listing } = await getListingById(id);
    statusEl.textContent = "";
    renderSingleListing(listing);
  } catch (err) {
    statusEl.textContent = `Could not load listing: ${err.message}`;
    if (DEBUG) console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (isHomePage()) loadHomeListings();
  if (isListingPage()) loadSingleListing();
  if (isLoginPage()) initLoginForm();
  if (isRegisterPage()) initRegisterForm();
});
