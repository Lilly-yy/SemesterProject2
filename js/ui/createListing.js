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

  const imageUrlInput = document.getElementById("imageUrl");
  const imageAltInput = document.getElementById("imageAlt");

  const images = []; // { url, alt }

  function renderImagesList() {
    if (!imagesListEl) return;

    imagesListEl.replaceChildren();

    if (images.length === 0) {
      const p = document.createElement("p");
      p.className = "text-sm text-slate-500";
      p.textContent = "No images added yet.";
      imagesListEl.append(p);
      return;
    }

    for (const [index, imgData] of images.entries()) {
      const row = document.createElement("div");
      row.className =
        "flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200";

      const left = document.createElement("div");
      left.className = "flex items-center gap-3 min-w-0";

      // Thumbnail box
      const thumbWrap = document.createElement("div");
      thumbWrap.className =
        "h-12 w-12 overflow-hidden rounded-md bg-white ring-1 ring-slate-200 shrink-0";

      const thumbImg = document.createElement("img");
      thumbImg.src = imgData.url;
      thumbImg.alt = imgData.alt || "Listing image";
      thumbImg.loading = "lazy";
      thumbImg.className = "h-full w-full object-cover";

      // If image fails, show a safe text placeholder (no inline JS)
      thumbImg.onerror = () => {
        thumbWrap.replaceChildren();
        thumbWrap.classList.add(
          "flex",
          "items-center",
          "justify-center",
          "text-xs",
          "text-slate-500",
        );
        const span = document.createElement("span");
        span.textContent = "No img";
        thumbWrap.append(span);
      };

      thumbWrap.append(thumbImg);

      // Text
      const textWrap = document.createElement("div");
      textWrap.className = "min-w-0";

      const altP = document.createElement("p");
      altP.className = "truncate text-sm font-semibold text-slate-800";
      altP.textContent = imgData.alt || "Listing image";

      const urlP = document.createElement("p");
      urlP.className = "truncate text-xs text-slate-600";
      urlP.textContent = imgData.url;

      textWrap.append(altP, urlP);

      left.append(thumbWrap, textWrap);

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.dataset.removeIndex = String(index);
      removeBtn.className =
        "shrink-0 rounded-md px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50";
      removeBtn.textContent = "Remove";

      row.append(left, removeBtn);
      imagesListEl.append(row);
    }
  }

  // Initial render
  renderImagesList();

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

    if (images.length >= 6) {
      statusEl.textContent = "You can add up to 6 images.";
      return;
    }

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
