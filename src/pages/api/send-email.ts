import type { APIRoute } from "astro";
import { Resend } from "resend";
import { getCfEnv } from "@/lib/cloudflare";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, name, message, turnstileToken } = await request.json();

    // 1. Validasi input dasar
    if (!email || !name || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ambil variabel env
    const cfEnv = getCfEnv();
    const resendApiKey = cfEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    const turnstileSecret = cfEnv.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
    const toEmail = cfEnv.RESEND_TO_EMAIL || import.meta.env.RESEND_TO_EMAIL || process.env.RESEND_TO_EMAIL || "helmiarimbawa46@gmail.com";

    // 2. Validasi Turnstile (Captcha) server-side
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: "Turnstile token is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const turnstileResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: turnstileSecret || "",
        response: turnstileToken,
      }),
    });

    const turnstileResult = (await turnstileResponse.json()) as { success: boolean };
    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({ error: "Captcha verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Kirim email menggunakan Resend SDK
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "Email service configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: toEmail,
      subject: `New Portfolio Message from ${name}`,
      replyTo: email,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("API send-email error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
