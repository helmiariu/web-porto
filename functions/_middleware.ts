interface Env {
    DB: D1Database; // Pastikan nama binding sesuai dengan di dashboard Pages kamu
}

export const onRequest: PagesFunction<Env> = async (context) => {
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

        // Cloudflare otomatis menyuntikkan data geolokasi di request.cf
        const country = (request.cf as any)?.country || "Unknown";
        const userAgent = request.headers.get("user-agent") || "Unknown";

        // 3. OPTIMASI (Sangat Penting!): Jangan biarkan proses simpan database memperlambat loading web.
        // Kita gunakan context.waitUntil() agar query SQL berjalan di latar belakang (background process)
        // setelah halaman web sukses dikirim ke pengunjung.
        context.waitUntil(
            context.env.DB.prepare(
                "INSERT INTO web_analytics (page_path, country, user_agent) VALUES (?1, ?2, ?3)"
            )
                .bind(pagePath, country, userAgent)
                .run()
                .catch((err) => console.error("Gagal menyimpan analitik:", err))
        );
    }

    // 4. Lanjutkan request untuk menampilkan halaman website seperti biasa
    return await context.next();
};