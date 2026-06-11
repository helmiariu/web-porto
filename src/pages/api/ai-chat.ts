// src/pages/api/ai-chat.ts
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async (context) => {
    const request = context.request;
    const cfEnv = env as any;

    try {
        // 1. Ambil IP Address Client
        const clientIP = request.headers.get("CF-Connecting-IP") || "unknown-ip";

        // Bypass rate limit untuk localhost saat development
        const isLocal = clientIP === "127.0.0.1" || clientIP === "::1" || clientIP === "unknown-ip";

        if (!isLocal) {
            // 2. Cek Rate Limit di KV instance 'prod-web-porto' (5 request / 2 jam)
            const kvKey = `ratelimit:${clientIP}`;
            const currentData = await cfEnv["prod-web-porto"].get(kvKey, "json") as { count: number; expiresAt: number } | null;

            const now = Date.now();

            if (currentData) {
                if (now > currentData.expiresAt) {
                    // Masa berlaku habis, buat ulang record baru
                    await cfEnv["prod-web-porto"].put(
                        kvKey,
                        JSON.stringify({ count: 1, expiresAt: now + 2 * 60 * 60 * 1000 }),
                        { expirationTtl: 2 * 60 * 60 } // Expire otomatis dalam 2 jam
                    );
                } else if (currentData.count >= 5) {
                    // Limit harian tercapai
                    const timeLeftSeconds = Math.round((currentData.expiresAt - now) / 1000);
                    const minutes = Math.floor(timeLeftSeconds / 60);
                    return new Response(
                        JSON.stringify({
                            error: `Batas limit chat tercapai. Silakan coba lagi dalam ${minutes} menit.`,
                        }),
                        {
                            status: 429,
                            headers: {
                                "Content-Type": "application/json",
                                "Retry-After": timeLeftSeconds.toString(),
                            },
                        }
                    );
                } else {
                    // Tambah hit count
                    await cfEnv["prod-web-porto"].put(
                        kvKey,
                        JSON.stringify({ count: currentData.count + 1, expiresAt: currentData.expiresAt }),
                        { expirationTtl: Math.max(60, Math.round((currentData.expiresAt - now) / 1000)) }
                    );
                }
            } else {
                // Record IP belum ada, buat baru
                await cfEnv["prod-web-porto"].put(
                    kvKey,
                    JSON.stringify({ count: 1, expiresAt: now + 2 * 60 * 60 * 1000 }),
                    { expirationTtl: 2 * 60 * 60 }
                );
            }
        }

        // 3. Ambil Body Request dari Frontend Astro
        const { messages } = await request.json() as { messages: Array<{ role: string; content: string }> };
        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Format pesan tidak valid." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 4. Format payload ke format Gemini API
        const contents = messages.map((msg) => ({
            role: msg.role === "ai" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        // 5. Hubungi Gemini API (Menggunakan model gemini-3.1-flash-lite)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${cfEnv.GEMINI_API_KEY}`;
        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: "Anda adalah asisten AI virtual untuk website portofolio milik Helmi, seorang profesional IT dan Web Developer. Tugas utama Anda adalah menjawab pertanyaan pengunjung tentang pengalaman, keahlian (seperti frontend, modern DevOps, dan engineering tools), serta karya-karyanya. Selalu gunakan Bahasa Indonesia yang ramah, profesional, dan relevan dengan dunia teknologi, meskipun pengunjung menggunakan bahasa lain atau salah ketik."
                    }]
                },
                contents: contents
            }),
        });

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            console.error("DEBUG - GEMINI ERROR:", errText);
            return new Response(JSON.stringify({ error: "Gemini API Error" }), {
                status: geminiResponse.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        const geminiData = await geminiResponse.json() as any;
        const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak menerima respon valid.";

        // 6. Kembalikan respon ke Frontend Astro
        return new Response(JSON.stringify({ content: replyText }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("🔥 FATAL ERROR DI FUNCTIONS:", error.message);
        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
