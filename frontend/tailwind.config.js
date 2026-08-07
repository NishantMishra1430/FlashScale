// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // This tells Tailwind to look for classes inside your HTML and all React components
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // We are sticking to minimalist defaults, but if you wanted to add
    // custom brand colors or fonts later, you would do it right here.
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // Adds a clean, modern default font
      },
    },
  },
  plugins: [],
};
