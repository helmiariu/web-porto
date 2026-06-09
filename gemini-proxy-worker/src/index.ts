export interface Env {
	RATE_LIMIT_KV: KVNamespace;
	GEMINI_API_KEY: string;
}

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "https://ai-chat.helmiari.my.id/", // Sesuaikan dengan domain web porto Anda nanti demi keamanan https://ai-chat.helmiari.my.id/
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// 1. Handle CORS Preflight Request
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: CORS_HEADERS });
		}

		if (request.method !== "POST") {
			return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
		}

		try {
			// 2. Ambil IP Address Client
			const clientIP = request.headers.get("CF-Connecting-IP") || "unknown-ip";

			// Bypass rate limit untuk localhost saat development (Opsional)
			const isLocal = clientIP === "127.0.0.1" || clientIP === "::1" || clientIP === "unknown-ip";

			if (!isLocal) {
				// 3. Cek Rate Limit di Cloudflare KV (5 request / 2 jam)
				const kvKey = `ratelimit:${clientIP}`;
				const currentData = await env.RATE_LIMIT_KV.get(kvKey, "json") as { count: number; expiresAt: number } | null;

				const now = Date.now();

				if (currentData) {
					if (now > currentData.expiresAt) {
						// Masa berlaku habis, buat ulang record baru
						await env.RATE_LIMIT_KV.put(
							kvKey,
							JSON.stringify({ count: 1, expiresAt: now + 2 * 60 * 60 * 1000 }), // 2 jam
							{ expirationTtl: 2 * 60 * 60 } // Expire KV key otomatis setelah 2 jam
						);
					} else if (currentData.count >= 5) {
						// Limit terlampaui
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
									...CORS_HEADERS,
									"Retry-After": timeLeftSeconds.toString(),
								},
							}
						);
					} else {
						// Tambah hit count
						await env.RATE_LIMIT_KV.put(
							kvKey,
							JSON.stringify({ count: currentData.count + 1, expiresAt: currentData.expiresAt }),
							{ expirationTtl: Math.max(60, Math.round((currentData.expiresAt - now) / 1000)) }
						);
					}
				} else {
					// Record IP belum ada, buat baru
					await env.RATE_LIMIT_KV.put(
						kvKey,
						JSON.stringify({ count: 1, expiresAt: now + 2 * 60 * 60 * 1000 }),
						{ expirationTtl: 2 * 60 * 60 }
					);
				}
			}

			// 4. Ambil Body Request dari Frontend
			const { messages } = await request.json() as { messages: Array<{ role: string; content: string }> };
			if (!messages || !Array.isArray(messages)) {
				return new Response(JSON.stringify({ error: "Format pesan tidak valid." }), {
					status: 400,
					headers: { "Content-Type": "application/json", ...CORS_HEADERS },
				});
			}

			// 5. Format payload ke format Gemini API (gemini-1.5-flash)
			// Gemini menggunakan "user" dan "model" sebagai roles
			const contents = messages.map((msg) => ({
				role: msg.role === "ai" ? "model" : "user",
				parts: [{ text: msg.content }],
			}));

			// 6. Hubungi Gemini API
			const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`;
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
				return new Response(JSON.stringify({ error: "Gemini API Error", details: errText }), {
					status: geminiResponse.status,
					headers: { "Content-Type": "application/json", ...CORS_HEADERS },
				});
			}

			const geminiData = await geminiResponse.json() as any;
			const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak menerima respon valid.";

			// 7. Kembalikan respon ke Frontend
			return new Response(JSON.stringify({ content: replyText }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					...CORS_HEADERS,
				},
			});

		} catch (err: any) {
			return new Response(JSON.stringify({ error: "Internal Server Error", message: err.message }), {
				status: 500,
				headers: { "Content-Type": "application/json", ...CORS_HEADERS },
			});
		}
	},
};
