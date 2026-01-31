import { loginUser, registerUser } from "../api/auth.js";
import { saveAuth } from "../utils/storage.js";

function isNoroffStudentEmail(email) {
  return email.toLowerCase().endsWith("@stud.noroff.no");
}

export function initRegisterForm() {
  const form = document.getElementById("registerForm");
  const status = document.getElementById("registerStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Registering…";

    const name = form.querySelector("#name")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const password = form.querySelector("#password")?.value;
    const avatarUrl = form.querySelector("#avatar")?.value.trim();

    if (!isNoroffStudentEmail(email)) {
      status.textContent = "You must register with a @stud.noroff.no email.";
      return;
    }

    try {
      await registerUser({
        name,
        email,
        password,
        avatar: avatarUrl ? { url: avatarUrl, alt: "" } : undefined,
      });

      window.location.href = "login.html";
    } catch (err) {
      status.textContent = `Register failed: ${err.message}`;
    }
  });
}

export function initLoginForm() {
  const form = document.getElementById("loginForm");
  const status = document.getElementById("loginStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Logging in…";

    const email = form.querySelector("#email")?.value.trim();
    const password = form.querySelector("#password")?.value;

    try {
      const auth = await loginUser({ email, password });

      saveAuth({
        accessToken: auth.accessToken,
        name: auth.name,
        email: auth.email,
        avatar: auth.avatar,   
        banner: auth.banner,   
      });

      window.location.href = "profile.html";
    } catch (err) {
      status.textContent = `Login failed: ${err.message}`;
    }
  });
}
