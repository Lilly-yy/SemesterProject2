import { getAuth, clearAuth, saveAuth } from "../utils/storage.js";
import { getProfile, updateAvatar } from "../api/profile.js";

function setText(el, text) {
  if (el) el.textContent = text;
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
