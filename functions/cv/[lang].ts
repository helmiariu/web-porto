interface Env {
    // Menggunakan tanda kutip karena nama binding mengandung tanda hubung (-)
    "prod-web-porto": KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    // 1. Ambil parameter [lang] dari URL (misal dari /cv/id atau /cv/en)
    const lang = context.params.lang as string;

    // 2. Buat nama key menjadi huruf kecil semua (lowercase) 
    // agar cocok dengan 'cv:id' atau 'cv:en' yang kamu buat di KV Pairs
    const keyName = `cv:${lang.toLowerCase()}`;

    try {
        // 3. Ambil link CV dari instance KV 'prod-web-porto'
        const destinationLink = await context.env["prod-web-porto"].get(keyName);

        // 4. Jika link ditemukan, langsung redirect pengunjung
        if (destinationLink) {
            return Response.redirect(destinationLink, 302);
        }

        // 5. ANTISIPASI: Jika salah ketik bahasa (misal /cv/xyz) atau key 'cv:en' belum diisi,
        // kita gunakan 'cv:id' (Bahasa Indonesia) sebagai fallback/cadangan utama.
        const fallbackLink = await context.env["prod-web-porto"].get("cv:id");
        if (fallbackLink) {
            return Response.redirect(fallbackLink, 302);
        }

        // 6. Jika di database KV benar-benar kosong total,
        // tendang pengunjung kembali ke halaman utama website kamu
        const url = new URL(context.request.url);
        return Response.redirect(url.origin, 302);

    } catch (error) {
        // Jika ada gangguan koneksi ke KV, kembalikan ke halaman utama agar tidak memicu error 500
        const url = new URL(context.request.url);
        return Response.redirect(url.origin, 302);
    }
};