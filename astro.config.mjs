// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon"; // 1. Impor astro-icon di sini

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import cloudflare from "@astrojs/cloudflare";
import { sharpImageService } from 'astro/config';


// https://astro.build/config
export default defineConfig({
  output: 'static',

  image: {
    service: sharpImageService(),
  },

  adapter: cloudflare({
    configPath: 'wrangler.toml',
    platformProxy: {
      enabled: isLocalDev && !isCloudflareCI
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