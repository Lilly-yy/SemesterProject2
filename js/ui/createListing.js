import { createListing } from "../api/createListing.js";

function toIsoFromDatetimeLocal(value) {
  // value: "2026-02-03T12:30"
  const d = new Date(value);
  const t = d.getTime();
  if (!Number.isFinite(t)) return null;
  return d.toISOString();
}

function parseTags(value) {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function initCreateListingPage() {
  const form = document.getElementById("createListingForm");
  const statusEl = document.getElementById("createListingStatus");

  if (!form || !statusEl) return;

  const addImageBtn = document.getElementById("addImageBtn");
const imagesListEl = document.getElementById("imagesList");

const images = []; // { url, alt }

function renderImagesList() {
  if (!imagesListEl) return;

  if (images.length === 0) {
    imagesListEl.innerHTML =
      '<p class="text-sm text-slate-500">No images added yet.</p>';
    return;
  }

  imagesListEl.innerHTML = images
    .map(
      (img, index) => `
        <div class="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-800">${img.alt}</p>
            <p class="truncate text-xs text-slate-600">${img.url}</p>
          </div>
          <button
            type="button"
            data-remove-index="${index}"
            class="shrink-0 rounded-md px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Remove
          </button>
        </div>
      `,
    )
    .join("");
}
const imageUrlInput = document.getElementById("imageUrl");
const imageAltInput = document.getElementById("imageAlt");


function renderImagesList() {
  if (!imagesListEl) return;

  if (images.length === 0) {
    imagesListEl.innerHTML =
      '<p class="text-sm text-slate-500">No images added yet.</p>';
    return;
  }

  imagesListEl.innerHTML = images
    .map(
      (img, index) => `
        <div class="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-12 w-12 overflow-hidden rounded-md bg-white ring-1 ring-slate-200 shrink-0">
              <img
                src="${img.url}"
                alt="${img.alt}"
                class="h-full w-full object-cover"
                loading="lazy"
                onerror="this.style.display='none'; this.parentElement.textContent='No img'; this.parentElement.classList.add('flex','items-center','justify-center','text-xs','text-slate-500');"
              />
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-800">${img.alt}</p>
              <p class="truncate text-xs text-slate-600">${img.url}</p>
            </div>
          </div>

          <button
            type="button"
            data-remove-index="${index}"
            class="shrink-0 rounded-md px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Remove
          </button>
        </div>
      `,
    )
    .join("");
}


addImageBtn?.addEventListener("click", () => {
  statusEl.textContent = "";

const url = imageUrlInput?.value.trim() || "";
const alt = imageAltInput?.value.trim() || "Listing image";


  if (!url) {
    statusEl.textContent = "Please enter an image URL.";
    return;
  }

  if (!isValidUrl(url)) {
    statusEl.textContent = "Image URL must be a valid http/https URL.";
    return;
  }

  // max 6
  if (images.length >= 6) {
    statusEl.textContent = "You can add up to 6 images.";
    return;
  }

  // avoid duplicates
  const exists = images.some((img) => img.url === url);
  if (exists) {
    statusEl.textContent = "That image URL has already been added.";
    return;
  }

  images.push({ url, alt });
  renderImagesList();

if (imageUrlInput) {
  imageUrlInput.value = "";
  imageUrlInput.focus();
}

});

imagesListEl?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-remove-index]");
  if (!btn) return;

  const index = Number(btn.getAttribute("data-remove-index"));
  if (!Number.isFinite(index)) return;

  images.splice(index, 1);
  renderImagesList();
});


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusEl.textContent = "";

    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const endsAtLocal = form.endsAt.value;
    const tagsRaw = form.tags.value.trim();

const media = images.length ? images : [];


    if (!title) {
      statusEl.textContent = "Title is required.";
      return;
    }

    const endsAt = toIsoFromDatetimeLocal(endsAtLocal);
    if (!endsAt) {
      statusEl.textContent = "End date/time is required.";
      return;
    }
    if (new Date(endsAt).getTime() <= Date.now()) {
      statusEl.textContent = "End date/time must be in the future.";
      return;
    }

    const tags = tagsRaw ? parseTags(tagsRaw) : [];


    try {
      statusEl.textContent = "Creating listing…";

      const payload = await createListing({
        title,
        description: description || undefined,
        tags: tags.length ? tags : undefined,
        media: media.length ? media : undefined,
        endsAt,
      });

      const id = payload?.data?.id;
      if (!id) throw new Error("Listing created, but missing id in response.");

      window.location.href = `listing.html?id=${encodeURIComponent(id)}`;
    } catch (err) {
      statusEl.textContent = `Could not create listing: ${err.message}`;
    }
  });
}
