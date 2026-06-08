// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon"; // 1. Impor astro-icon di sini

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    }
  }),

  // 2. Daftarkan astro-icon di dalam array integrations
  integrations: [icon(), react(), mdx()],
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