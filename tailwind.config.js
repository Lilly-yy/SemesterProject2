/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#ECFDF5",   // Light mint
          DEFAULT: "#022C22",    // Dark forest
        },
        accent: {
          light: "#FCD34D", // Light amber
          DEFAULT: "#FBBF24", // Dark amber
      
        },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
