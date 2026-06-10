// ... (bagian import & setup sama seperti sebelumnya)

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { name, email, message } = await context.request.json();

    // Ambil email tujuan dari KV
    const destinationEmail = await context.env["prod-web-porto"].get("site:email");

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
};