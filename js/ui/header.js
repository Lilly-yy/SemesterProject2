import { getAuth, clearAuth } from "../utils/storage.js";
function showOnDesktop(el) {
  if (!el) return;
  el.classList.remove("sm:hidden");
}

function hideOnDesktop(el) {
  if (!el) return;
  el.classList.add("sm:hidden");
}

function showMobileItem(el) {
  el?.classList.remove("hidden");
}

function hideMobileItem(el) {
  el?.classList.add("hidden");
}

export function initHeader() {
  const auth = getAuth();
  const loggedIn = Boolean(auth?.accessToken);

  // Desktop
  const loginLink = document.getElementById("headerLoginLink");
  const logoutBtn = document.getElementById("headerLogoutBtn");
  const createLink = document.getElementById("headerCreateListingLink");

  const avatarImg = document.getElementById("headerAvatar");
  const avatarFallback = document.getElementById("headerAvatarFallback");

  // Mobile menu
  const menuBtn = document.getElementById("headerMenuBtn");
  const mobileMenu = document.getElementById("headerMobileMenu");

  const mobileLogin = document.getElementById("headerMobileLoginLink");
  const mobileLogout = document.getElementById("headerMobileLogoutBtn");
  const mobileCreate = document.getElementById("headerMobileCreateLink");

  // --- Desktop auth ---
  if (loggedIn) {
    hideOnDesktop(loginLink);
    showOnDesktop(logoutBtn);
    showOnDesktop(createLink);
  } else {
    showOnDesktop(loginLink);
    hideOnDesktop(logoutBtn);
    hideOnDesktop(createLink);
  }

  // --- Mobile menu auth items ---
  if (loggedIn) {
    hideMobileItem(mobileLogin);
    showMobileItem(mobileLogout);
    showMobileItem(mobileCreate);
  } else {
    showMobileItem(mobileLogin);
    hideMobileItem(mobileLogout);
    hideMobileItem(mobileCreate);
  }

  // --- Avatar ---
  if (avatarImg && avatarFallback) {
    const url = auth?.avatar?.url || "";
    if (url) {
      avatarImg.src = url;
      avatarImg.classList.remove("hidden");
      avatarFallback.classList.add("hidden");
    } else {
      avatarImg.classList.add("hidden");
      avatarFallback.classList.remove("hidden");
    }
  }

  // --- Logout ---
  const doLogout = () => {
    clearAuth();
    window.location.href = "index.html";
  };
  logoutBtn?.addEventListener("click", doLogout);
  mobileLogout?.addEventListener("click", doLogout);

  // --- Mobile menu toggle ---
  if (menuBtn && mobileMenu) {
    if (!mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }
    mobileMenu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.addEventListener("click", () => {
      const willOpen = mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden", !willOpen);
      mobileMenu.hidden = !willOpen;
      menuBtn.setAttribute("aria-expanded", String(willOpen));
    });
  }
}
