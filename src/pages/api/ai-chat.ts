// src/pages/api/ai-chat.ts
import type { APIRoute } from "astro";
import { getKV, getGeminiApiKey, getDB, setCfEnv } from "@lib/cloudflare";
import { getSession } from "auth-astro/server";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { aiChatMessages, users } from "../../db/schema";

export const POST: APIRoute = async (context) => {
    // Sinkronkan environment Cloudflare dari context request
    if (context.locals?.runtime?.env) {
        setCfEnv(context.locals.runtime.env);
    }

    // Inisialisasi Deferred Promise untuk memantau proses simpan database latar belakang
    let resolveDbSave: () => void = () => {};
    const dbSavePromise = new Promise<void>((resolve) => {
        resolveDbSave = resolve;
    });

    // Daftarkan Promise tersebut ke lifecycle runtime (waitUntil) agar thread worker tetap hidup
    const runtime = context.locals?.runtime;
    if (runtime?.ctx?.waitUntil) {
        runtime.ctx.waitUntil(dbSavePromise);
    } else if (runtime?.waitUntil) {
        runtime.waitUntil(dbSavePromise);
    }

    const request = context.request;
    const kv = getKV();

    // Start fetching system instruction early in parallel
    const systemInstructionPromise = kv.get("ai_system_instruction").catch((err) => {
        console.error("⚠️ Gagal mengambil instruksi sistem dari KV:", err);
        return null;
    });

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

        // Filter pesan bertanda error/loading agar tidak menodai konteks AI
        const filteredMessages = messages.filter((msg) => {
            const trimmed = msg.content.trim();
            return !(
                trimmed.startsWith("⚠️") || 
                trimmed.startsWith("⏳") || 
                trimmed.startsWith("🛠️")
            );
        });

        // Terapkan sliding window: Ambil maksimal 12 pesan terakhir (6 turn)
        const contextWindow = filteredMessages.slice(-12);

        // 3. Format payload ke format Gemini API
        const contents = contextWindow.map((msg) => ({
            role: msg.role === "ai" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        // Await dynamic system instruction (telah diproses paralel sejak awal request)
        let systemInstruction = await systemInstructionPromise;
        if (!systemInstruction) {
            systemInstruction = "Anda adalah asisten AI virtual untuk website portofolio milik Helmi, seorang profesional IT dan Web Developer. Tugas utama Anda adalah menjawab pertanyaan pengunjung tentang pengalaman, keahlian (seperti frontend, modern DevOps, dan engineering tools), serta karya-karyanya. Selalu gunakan Bahasa Indonesia yang ramah, profesional, dan relevan dengan dunia teknologi, meskipun pengunjung menggunakan bahasa lain atau salah ketik.";
        }

        // 4. Hubungi Gemini API (Menggunakan model gemini-3.1-flash-lite dengan streamGenerateContent)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse&key=${getGeminiApiKey()}`;
        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: systemInstruction
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

        const reader = geminiResponse.body?.getReader();
        if (!reader) {
            return new Response(JSON.stringify({ error: "Gagal membaca body respon Gemini." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder("utf-8");

        let accumulatedReply = "";

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

        // 6. Buat readable stream untuk mengirim data ke client secara real-time
        const customStream = new ReadableStream({
            async start(controller) {
                let buffer = "";
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });

                        let lineEnd = buffer.indexOf("\n");
                        while (lineEnd !== -1) {
                            const line = buffer.substring(0, lineEnd).trim();
                            buffer = buffer.substring(lineEnd + 1);

                            if (line.startsWith("data: ")) {
                                const jsonStr = line.substring(6).trim();
                                if (jsonStr) {
                                    try {
                                        const parsed = JSON.parse(jsonStr);
                                        const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                                        if (textChunk) {
                                            accumulatedReply += textChunk;
                                            controller.enqueue(encoder.encode(textChunk));
                                        }
                                    } catch (e) {
                                        // Abaikan error parsing jika chunk JSON belum selesai
                                    }
                                }
                            }
                            lineEnd = buffer.indexOf("\n");
                        }
                    }

                    // Flush sisa buffer terakhir jika ada
                    if (buffer.trim().startsWith("data: ")) {
                        const jsonStr = buffer.trim().substring(6).trim();
                        try {
                            const parsed = JSON.parse(jsonStr);
                            const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                            if (textChunk) {
                                accumulatedReply += textChunk;
                                controller.enqueue(encoder.encode(textChunk));
                            }
                        } catch (e) {}
                    }
                } catch (err) {
                    console.error("Error membaca stream Gemini:", err);
                    controller.error(err);
                } finally {
                    controller.close();

                    // 7. Simpan percakapan ke database setelah stream selesai secara asinkron
                    try {
                        const rawDb = getDB();
                        const db = drizzle(rawDb);
                        const latestUserMessage = messages[messages.length - 1];

                        if (latestUserMessage && latestUserMessage.role === "user" && accumulatedReply.trim()) {
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
                                content: accumulatedReply,
                            });

                            // Catat aktivitas AI Chat
                            try {
                                const { logActivity } = await import("../../lib/activity");
                                const identity = user?.name || user?.email || "Pengunjung umum";
                                await logActivity("ai_chat", `${identity} berinteraksi dengan AI Assistant (streaming)`);
                            } catch (actErr) {
                                console.error("Gagal mencatat log aktivitas AI chat:", actErr);
                            }
                        }
                    } catch (dbError) {
                        console.error("⚠️ Gagal menyimpan riwayat chat streaming ke database:", dbError);
                    } finally {
                        // Selesaikan deferred promise agar runtime mengizinkan worker ditangguhkan/dimatikan dengan aman
                        resolveDbSave();
                    }
                }
            }
        });

        // 8. Kembalikan respon stream ke Frontend Astro
        return new Response(customStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Content-Type-Options": "nosniff",
            },
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

export const GET: APIRoute = async (context) => {
    // Sinkronkan environment Cloudflare dari context request
    if (context.locals?.runtime?.env) {
        setCfEnv(context.locals.runtime.env);
    }
    const request = context.request;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    
    if (!sessionId) {
        return new Response(JSON.stringify({ error: "sessionId diperlukan." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const session = await getSession(request);
        const isLoggedIn = !!session?.user;
        const user = session?.user;
        const kv = getKV();

        let dbUserId: string | null = null;
        let chatClearedAt: string | null = null;

        // 1. Dapatkan userId jika login
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

        // 2. Ambil batas waktu penghapusan chat (chat_cleared_at) dari KV
        if (dbUserId) {
            chatClearedAt = await kv.get(`user:chat_cleared_at:${dbUserId}`);
        } else {
            chatClearedAt = await kv.get(`session:chat_cleared_at:${sessionId}`);
        }

        // 3. Query chat dari D1
        const rawDb = getDB();
        const db = drizzle(rawDb);
        let query;

        const { gt, and, eq } = await import("drizzle-orm");

        if (dbUserId) {
            // Pengguna login: ambil pesan miliknya (berdasarkan userId)
            if (chatClearedAt) {
                query = db
                    .select()
                    .from(aiChatMessages)
                    .where(
                        and(
                            eq(aiChatMessages.userId, dbUserId),
                            gt(aiChatMessages.createdAt, chatClearedAt)
                        )
                    );
            } else {
                query = db
                    .select()
                    .from(aiChatMessages)
                    .where(eq(aiChatMessages.userId, dbUserId));
            }
        } else {
            // Pengguna anonim: ambil pesan berdasarkan sessionId
            if (chatClearedAt) {
                query = db
                    .select()
                    .from(aiChatMessages)
                    .where(
                        and(
                            eq(aiChatMessages.sessionId, sessionId),
                            gt(aiChatMessages.createdAt, chatClearedAt)
                        )
                    );
            } else {
                query = db
                    .select()
                    .from(aiChatMessages)
                    .where(eq(aiChatMessages.sessionId, sessionId));
            }
        }

        const messages = await query.orderBy(aiChatMessages.createdAt);

        // 4. Format data untuk frontend
        const formattedMessages = messages.map((msg) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt ? new Date(msg.createdAt + " UTC") : new Date(),
        }));

        return new Response(JSON.stringify({ messages: formattedMessages }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
            },
        });

    } catch (error: any) {
        console.error("🔥 Gagal mengambil riwayat chat:", error.message);
        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};

export const DELETE: APIRoute = async (context) => {
    // Sinkronkan environment Cloudflare dari context request
    if (context.locals?.runtime?.env) {
        setCfEnv(context.locals.runtime.env);
    }
    const request = context.request;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
        return new Response(JSON.stringify({ error: "sessionId diperlukan." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const session = await getSession(request);
        const isLoggedIn = !!session?.user;
        const user = session?.user;
        const kv = getKV();

        let dbUserId: string | null = null;

        // Dapatkan userId jika login
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

        // Catat waktu saat ini dalam format SQLite UTC timestamp: YYYY-MM-DD HH:MM:SS
        const currentTimestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

        if (dbUserId) {
            // Simpan waktu penghapusan untuk pengguna terdaftar
            await kv.put(`user:chat_cleared_at:${dbUserId}`, currentTimestampStr);
        } else {
            // Simpan waktu penghapusan untuk session anonim
            await kv.put(`session:chat_cleared_at:${sessionId}`, currentTimestampStr);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("🔥 Gagal melakukan soft clear chat:", error.message);
        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
