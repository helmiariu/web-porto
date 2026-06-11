// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import auth from "auth-astro";

// IMPOR KEDUA ADAPTER
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";

// Cek apakah sedang running di local development
const isDev = process.env.NODE_ENV === "development" || process.argv.includes("dev");

export default defineConfig({
  // JIKA DEV: Gunakan Node adapter (supaya auth-astro senang & tidak error module)
  // JIKA PROD (BUILD): Gunakan Cloudflare adapter asli untuk di-deploy
  adapter: isDev
    ? node({ mode: "standalone" })
    : cloudflare({ mode: "directory", platformProxy: { enabled: true } }),

  integrations: [icon(), react(), mdx(), auth()],
  vite: {
    plugins: [tailwindcss()],
    assetsInclude: ['**/*.glb'],
    ssr: {
      noExternal: ['auth-astro', '@auth/core', 'astro-icon', '@lucide/astro'],
    },
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