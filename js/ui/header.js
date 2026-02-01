import { getAuth, isLoggedIn, clearAuth } from "../utils/storage.js";

export function initHeader() {
  const loginLink = document.getElementById("headerLoginLink");
  const logoutBtn = document.getElementById("headerLogoutBtn");
  const avatarImg = document.getElementById("headerAvatar");
  const avatarFallback = document.getElementById("headerAvatarFallback");

  const auth = getAuth();
  const loggedIn = Boolean(auth?.accessToken);

  // Toggle login/logout
  if (loginLink) loginLink.classList.toggle("hidden", loggedIn);
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !loggedIn);

  // Avatar
  const avatarUrl = auth?.avatar?.url || "";
  if (avatarImg && avatarFallback) {
    if (loggedIn && avatarUrl) {
      avatarImg.src = avatarUrl;
      avatarImg.classList.remove("hidden");
      avatarFallback.classList.add("hidden");
    } else {
      avatarImg.classList.add("hidden");
      avatarFallback.classList.remove("hidden");
    }
  }

  // Logout click
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.href = "index.html";
    });
  }
}
