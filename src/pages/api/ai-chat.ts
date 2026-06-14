// src/pages/api/ai-chat.ts
import type { APIRoute } from "astro";
import { getKV, getGeminiApiKey, getDB } from "@lib/cloudflare";
import { getSession } from "auth-astro/server";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { aiChatMessages, users } from "../../db/schema";

export const POST: APIRoute = async (context) => {
    const request = context.request;
    const kv = getKV();

    try {
        // 1. Deteksi Login & Batasan Rate Limit
        const session = await getSession(request);
        const isLoggedIn = !!session?.user;
        const user = session?.user;

        // Ambil IP Address Client
        const clientIP = request.headers.get("CF-Connecting-IP") || "unknown-ip";

        // Bypass rate limit untuk localhost saat development
        const isLocal = clientIP === "127.0.0.1" || clientIP === "::1" || clientIP === "unknown-ip";

        // Tentukan limit & KV key berdasarkan status login
        let limit = 5;
        let limitWindowMs = 2 * 60 * 60 * 1000; // 2 jam
        let kvKey = `ratelimit:ip:${clientIP}`;

        if (isLoggedIn && user) {
            limit = 15;
            limitWindowMs = 1 * 60 * 60 * 1000; // 1 jam
            const identifier = user.email || user.name || "unknown-user";
            kvKey = `ratelimit:user:${identifier}`;
        }

        if (!isLocal) {
            // Cek Rate Limit di KV
            const currentData = await kv.get(kvKey, "json") as { count: number; expiresAt: number } | null;
            const now = Date.now();

            if (currentData) {
                if (now > currentData.expiresAt) {
                    // Masa berlaku habis, buat ulang record baru
                    await kv.put(
                        kvKey,
                        JSON.stringify({ count: 1, expiresAt: now + limitWindowMs }),
                        { expirationTtl: Math.round(limitWindowMs / 1000) }
                    );
                } else if (currentData.count >= limit) {
                    // Limit tercapai
                    const timeLeftSeconds = Math.round((currentData.expiresAt - now) / 1000);
                    const minutes = Math.ceil(timeLeftSeconds / 60);

                    const errorMsg = isLoggedIn
                        ? `Batas limit chat tercapai. Silakan coba lagi dalam ${minutes} menit.`
                        : `Batas limit chat tercapai. Silakan masuk (login) untuk menambah batas limit menjadi 15 pesan/jam, atau coba lagi dalam ${minutes} menit.`;

                    return new Response(
                        JSON.stringify({
                            error: errorMsg,
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
                    await kv.put(
                        kvKey,
                        JSON.stringify({ count: currentData.count + 1, expiresAt: currentData.expiresAt }),
                        { expirationTtl: Math.max(60, Math.round((currentData.expiresAt - now) / 1000)) }
                    );
                }
            } else {
                // Record belum ada, buat baru
                await kv.put(
                    kvKey,
                    JSON.stringify({ count: 1, expiresAt: now + limitWindowMs }),
                    { expirationTtl: Math.round(limitWindowMs / 1000) }
                );
            }
        }

        // 2. Ambil Body Request dari Frontend Astro
        const { messages, sessionId = "default-session" } = await request.json() as { 
            messages: Array<{ role: string; content: string }>; 
            sessionId?: string;
        };

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Format pesan tidak valid." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 3. Format payload ke format Gemini API
        const contents = messages.map((msg) => ({
            role: msg.role === "ai" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        // 4. Hubungi Gemini API (Menggunakan model gemini-3.1-flash-lite)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${getGeminiApiKey()}`;
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

        // 5. Cari ID user di database jika login
        let dbUserId: string | null = null;
        if (isLoggedIn && user?.email) {
            try {
                const rawDb = getDB();
                const db = drizzle(rawDb);
                const results = await db
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.email, user.email))
                    .limit(1);
                
                if (results && results.length > 0) {
                    dbUserId = results[0].id;
                }
            } catch (dbUserError) {
                console.error("⚠️ Gagal mencari ID user di database:", dbUserError);
            }
        }

        // 6. Simpan percakapan ke database (pertanyaan user & jawaban AI)
        try {
            const rawDb = getDB();
            const db = drizzle(rawDb);
            const latestUserMessage = messages[messages.length - 1];

            if (latestUserMessage && latestUserMessage.role === "user") {
                // Simpan pertanyaan user
                await db.insert(aiChatMessages).values({
                    sessionId: sessionId,
                    userId: dbUserId,
                    role: "user",
                    content: latestUserMessage.content,
                });

                // Simpan jawaban AI
                await db.insert(aiChatMessages).values({
                    sessionId: sessionId,
                    userId: dbUserId,
                    role: "ai",
                    content: replyText,
                });

                // Catat aktivitas AI Chat
                try {
                    const { logActivity } = await import("../../lib/activity");
                    const identity = user?.name || user?.email || "Pengunjung umum";
                    await logActivity("ai_chat", `${identity} berinteraksi dengan AI Assistant`);
                } catch (actErr) {
                    console.error("Gagal mencatat log aktivitas AI chat:", actErr);
                }
            }
        } catch (dbError) {
            console.error("⚠️ Gagal menyimpan riwayat chat ke database:", dbError);
        }

        // 7. Kembalikan respon ke Frontend Astro
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
