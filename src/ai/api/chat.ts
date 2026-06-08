import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const CHAT_LIMITS = env.CHAT_LIMITS;
  const AI = env.AI;

  if (!CHAT_LIMITS) {
    return new Response(
      JSON.stringify({ error: "Missing CHAT_LIMITS KV namespace binding." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!AI) {
    return new Response(
      JSON.stringify({ error: "Missing AI binding in Cloudflare environment." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Identify user IP using Cloudflare headers
  const clientIP = context.request.headers.get("cf-connecting-ip") || "127.0.0.1";
  const limitKey = `rate_limit:${clientIP}`;
  
  let currentCount = 0;
  try {
    const value = await CHAT_LIMITS.get(limitKey);
    if (value) {
      currentCount = parseInt(value, 10);
    }
  } catch (err: any) {
    console.error("KV read error:", err);
  }

  // Maximum of 5 questions per IP per 24 hours
  if (currentCount >= 5) {
    return new Response(
      JSON.stringify({
        error: "Batas harian tercapai. Anda telah mencapai batas maksimal 5 pertanyaan per 24 jam. Silakan coba lagi besok!"
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse request body
  let messages;
  try {
    const body = await context.request.json();
    messages = body.messages;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Format request tidak valid." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!messages || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "Parameter 'messages' wajib diisi berupa array." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Setup system prompt
  const systemPrompt = 
    "Kamu adalah asisten AI di web portofolio Helmi. Jawab dengan ramah, profesional, dan maksimal 2 paragraf pendek. " +
    "Helmi adalah seorang IT profesional yang berfokus pada DevOps, Web Development (Astro, Cloudflare Pages/Workers, React), " +
    "Infrastruktur Server (Linux, Docker, Proxmox), dan memiliki keahlian dalam CAD & 3D Modeling (SolidWorks). " +
    "Jika ada pertanyaan di luar keahlian teknis atau CV ini, arahkan pengguna untuk mengirim email.";

  // Build the message list starting with system prompt
  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))
  ];

  try {
    // Call Cloudflare Workers AI model @cf/meta/llama-3.1-8b-instruct
    const response = await AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: formattedMessages
    });

    // Increment the limit counter in KV and set TTL to 24 hours (86400 seconds)
    await CHAT_LIMITS.put(limitKey, (currentCount + 1).toString(), { expirationTtl: 86400 });

    return new Response(
      JSON.stringify({ response }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Workers AI invocation error:", err);
    return new Response(
      JSON.stringify({ error: `Gagal mendapatkan respon dari AI: ${err.message || err}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
