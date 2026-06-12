import { Auth } from "@auth/core";
import { D1Adapter } from "@auth/d1-adapter";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import type { APIRoute } from "astro";
import { getDB, getCfEnv } from "@lib/cloudflare";

export const ALL: APIRoute = async ({ request }) => {
    const cfEnv = getCfEnv();
    const db = getDB();

    return Auth(request, {
        // Menyuntikkan D1 Adapter agar user tersimpan otomatis
        adapter: D1Adapter(db),
        providers: [
            GitHub({
                clientId: cfEnv.GITHUB_CLIENT_ID,
                clientSecret: cfEnv.GITHUB_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true,
            }),
            Google({
                clientId: cfEnv.GOOGLE_CLIENT_ID,
                clientSecret: cfEnv.GOOGLE_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true,
            }),
        ],
        // Secret untuk enkripsi cookie
        secret: cfEnv.AUTH_SECRET,
        trustHost: true, // Wajib diaktifkan untuk environment Cloudflare
    });
};

