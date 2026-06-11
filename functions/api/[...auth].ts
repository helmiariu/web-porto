import { Auth } from "@auth/core";
import { D1Adapter } from "@auth/d1-adapter";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";

// Di Cloudflare Pages Functions murni, fungsinya diekspor menggunakan onRequest
export const onRequest: PagesFunction<{
    "prod-web-porto": KVNamespace; // Jika butuh KV lama
    DB: D1Database;                // Sesuaikan dengan nama binding D1 kamu di dashboard Pages
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    AUTH_SECRET: string;
}> = async (context) => {
    const { request, env } = context;

    // Jalankan core Auth.js langsung di runtime Cloudflare
    return Auth(request, {
        // Menyuntikkan D1 Adapter agar user tersimpan otomatis ke database prod-web-porto kamu
        adapter: D1Adapter(env.DB),
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
        secret: env.AUTH_SECRET,
        trustHost: true,
    });
};