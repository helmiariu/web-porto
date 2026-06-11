import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

export const onRequest = defineMiddleware(async (context, next) => {
    const request = context.request;
    const url = new URL(request.url);

    // 1. FILTER: Kita hanya ingin mencatat kunjungan halaman HTML biasa.
    // Jangan catat request untuk file aset seperti .css, .js, gambar, atau favicon.
    const isHtmlPage = request.headers.get("accept")?.includes("text/html");

    // Jangan catat juga jika request mengarah ke API internal kita sendiri
    const isApi = url.pathname.startsWith("/api/");

    if (isHtmlPage && !isApi) {
        // 2. Ambil data analitik dari request Cloudflare
        const pagePath = url.pathname;
        const db = (env as any).DB;

        if (db) {
            // Cloudflare otomatis menyuntikkan data geolokasi di request.cf
            const country = (request as any).cf?.country || "Unknown";
            const userAgent = request.headers.get("user-agent") || "Unknown";

            // 3. OPTIMASI (Sangat Penting!): Jangan biarkan proses simpan database memperlambat loading web.
            // Kita gunakan runtime.waitUntil() agar query SQL berjalan di latar belakang (background process)
            // setelah halaman web sukses dikirim ke pengunjung.
            const runtime = context.locals.runtime;
            if (runtime && typeof runtime.waitUntil === "function") {
                runtime.waitUntil(
                    db.prepare(
                        "INSERT INTO web_analytics (page_path, country, user_agent) VALUES (?1, ?2, ?3)"
                    )
                        .bind(pagePath, country, userAgent)
                        .run()
                        .catch((err: any) => console.error("Gagal menyimpan analitik:", err))
                );
            } else {
                await db.prepare(
                    "INSERT INTO web_analytics (page_path, country, user_agent) VALUES (?1, ?2, ?3)"
                )
                    .bind(pagePath, country, userAgent)
                    .run()
                    .catch((err: any) => console.error("Gagal menyimpan analitik:", err));
            }
        }
    }

    // 4. Lanjutkan request untuk menampilkan halaman website seperti biasa
    return next();
});
