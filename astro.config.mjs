// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import auth from "auth-astro";

// IMPOR KEDUA ADAPTER
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";

// Cek apakah sedang running di local development
const isDev = process.env.NODE_ENV === "development" || process.argv.includes("dev");

export default defineConfig({
  output: "server",
  adapter: isDev
    ? node({ mode: "standalone" })
    : cloudflare({ platformProxy: { enabled: true } }),

  integrations: [react(), mdx(), auth()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    assetsInclude: ['**/*.glb'],
    optimizeDeps: {
      include: ['auth-astro'],
    },
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