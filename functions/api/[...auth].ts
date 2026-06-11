import { Auth } from "@auth/core";
import { D1Adapter } from "@auth/d1-adapter";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ request, locals }) => {
    // Mengambil instance database D1 dari runtime Cloudflare Pages
    const env = locals.runtime.env;

    return Auth(request, {
        // Menyuntikkan D1 Adapter agar user tersimpan otomatis
        adapter: D1Adapter(env["prod-porto-db"]),
        providers: [
            GitHub({
                clientId: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
            }),
            Google({
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
            }),
        ],
        // Secret untuk enkripsi cookie
        secret: env.AUTH_SECRET,
        trustHost: true, // Wajib diaktifkan untuk environment Cloudflare
    });
};