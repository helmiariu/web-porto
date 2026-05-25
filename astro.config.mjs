// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon"; // 1. Impor astro-icon di sini

// https://astro.build/config
export default defineConfig({
  // 2. Daftarkan astro-icon di dalam array integrations
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
