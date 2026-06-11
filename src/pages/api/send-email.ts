import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async (context) => {
    const { name, email, message } = await context.request.json();
    const cfEnv = env as any;

    // Ambil email tujuan dari KV
    const destinationEmail = await cfEnv["prod-web-porto"].get("site:email");

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
