import type { APIRoute } from "astro";
import { getKV } from "@lib/cloudflare";

export const GET: APIRoute = async () => {
    try {
        const kv = getKV();
        // 1. Ambil semua key yang punya awalan "cv:" dari KV
        const kvList = await kv.list({ prefix: "cv:" });

        // 2. Olah datanya menjadi format array objek yang rapi untuk frontend
        const languages = kvList.keys.map((item: any) => {
            // item.name berisi "cv:id" atau "cv:en"
            const code = item.name.split(":")[1]; // Mengambil kata setelah titik dua ("id" atau "en")

            // Mapping standar kode bahasa ke nama labelnya
            const labelMap: Record<string, string> = {
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

