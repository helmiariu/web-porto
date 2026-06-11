// auth.config.ts
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { D1Adapter } from "@auth/d1-adapter";
import { defineConfig } from "auth-astro";
import { getDB, getCfEnv } from "./src/lib/cloudflare";

let db: any = null;
let cfEnv: any = {};
try {
  db = getDB();
  cfEnv = getCfEnv() || {};
} catch (e) {
  // Fallback aman untuk environment non-Cloudflare (seperti Node dev lokal)
  console.warn("Cloudflare environment bindings not available. Using process/import.meta.env fallbacks.");
}

export default defineConfig({
    adapter: db ? D1Adapter(db) : undefined,
    providers: [
        GitHub({
            clientId: cfEnv.GITHUB_CLIENT_ID || import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: cfEnv.GITHUB_CLIENT_SECRET || import.meta.env.GITHUB_CLIENT_SECRET,
        }),
        Google({
            clientId: cfEnv.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID,
            clientSecret: cfEnv.GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret: cfEnv.AUTH_SECRET || import.meta.env.AUTH_SECRET,
    trustHost: true,
});