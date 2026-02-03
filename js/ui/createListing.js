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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusEl.textContent = "";

    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const endsAtLocal = form.endsAt.value;
    const tagsRaw = form.tags.value.trim();

    const imgUrl = form.imageUrl.value.trim();
    const imgAlt = form.imageAlt.value.trim();

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

    const media = [];
    if (imgUrl) {
      if (!isValidUrl(imgUrl)) {
        statusEl.textContent = "Image URL must be a valid http/https URL.";
        return;
      }
      media.push({ url: imgUrl, alt: imgAlt || "Listing image" });
    }

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
