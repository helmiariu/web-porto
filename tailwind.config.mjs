/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat Variable", "sans-serif"], // <-- Sudah diganti ke Manrope "Manrope", "sans-serif",
      },
    },
  },
  plugins: [
    typography,
  ],
};
