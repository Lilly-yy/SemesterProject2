import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "/"),
        browse: resolve(__dirname, "browse.html"),
        listing: resolve(__dirname, "listing.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        profile: resolve(__dirname, "profile.html"),
        createListing: resolve(__dirname, "create-listing.html"),
      },
    },
  },
});
