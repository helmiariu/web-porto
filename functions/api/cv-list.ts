interface Env {
    "prod-web-porto": KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    try {
        // 1. Ambil semua key yang punya awalan "cv:" dari KV
        const kvList = await context.env["prod-web-porto"].list({ prefix: "cv:" });

        // 2. Olah datanya menjadi format array objek yang rapi untuk frontend
        const languages = kvList.keys.map((item) => {
            // item.name berisi "cv:id" atau "cv:en"
            const code = item.name.split(":")[1]; // Mengambil kata setelah titik dua ("id" atau "en")

            // Mapping standar kode bahasa ke nama labelnya
            const labelMap = {
                id: "Indonesia",
                en: "English",
                jp: "Japanese",
                kr: "Korean",
                cn: "Chinese",
                nl: "Dutch",      // Belanda
                de: "German",     // Jerman
                ru: "Russian",    // Rusia
                es: "Spanish",
                fr: "French",
                th: "Thai",
                vn: "Vietnamese"
            };

            // Ambil dari map berdasarkan code, jika tidak ada fallback ke uppercase code
            const label = labelMap[code.toLowerCase()] || code.toUpperCase();

            return { code, label };
        });

        return new Response(JSON.stringify({ languages }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ languages: [] }), { status: 500 });
    }
};