import type { APIRoute } from "astro";
import { getKV } from "@lib/cloudflare";

export const POST: APIRoute = async (context) => {
    const { name, email, message } = await context.request.json();
    const kv = getKV();

    // Ambil email tujuan dari KV
    const destinationEmail = await kv.get("site:email");

    const resendResponse = await fetch("https://api.resend.com/emails", {
        // ... (header sama)
        body: JSON.stringify({
            from: "Contact Form <onboarding@resend.dev>",
            to: destinationEmail, // <--- Sekarang dinamis dari KV!
            subject: `📩 Pesan Baru dari Portofolio: ${name}`,
            // ... (html body)
        }),
    });

    // ... (sisa logika return)
    return new Response(JSON.stringify({ success: true }));
};

