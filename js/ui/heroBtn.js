import { getAuth } from "../utils/storage.js";

export function initHeroBtn() {
  const cta = document.getElementById("heroPrimaryBtn");
  if (!cta) return;

  const auth = getAuth();
  const loggedIn = Boolean(auth?.accessToken);

  if (loggedIn) {
    cta.textContent = "My bids →";
    cta.href = "profile.html#my-bids";
  } else {
    cta.textContent = "Start bidding →";
    cta.href = "login.html";
  }
}
