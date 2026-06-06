// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon"; // 1. Impor astro-icon di sini

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // 2. Daftarkan astro-icon di dalam array integrations
  integrations: [icon(), react()],
  vite: {
    plugins: [tailwindcss()],
    assetsInclude: ['**/*.glb'],
  },
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
    ],
  },
});