import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
    const { name, email, message } = await context.request.json();
    const env = context.locals.runtime.env;

    // Ambil email tujuan dari KV
    const destinationEmail = await env["prod-web-porto"].get("site:email");

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
