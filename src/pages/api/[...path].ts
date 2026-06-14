import { Hono } from "hono";
import { getKV, getCfEnv } from "@/lib/cloudflare";
import { Resend } from "resend";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono().basePath("/api");

// 1. Endpoint: GET /api/get-email
app.get("/get-email", async (c) => {
  const kv = getKV();
  const email = await kv.get("site:email");
  return c.json({ email });
});

// Schema validasi untuk send-email
const sendEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  message: z.string().min(1),
  turnstileToken: z.string().min(1),
});

// 2. Endpoint: POST /api/send-email dengan Zod validation
app.post("/send-email", zValidator("json", sendEmailSchema), async (c) => {
  const { email, name, message, turnstileToken } = c.req.valid("json");
  const cfEnv = getCfEnv();
  
  const resendApiKey = cfEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  const turnstileSecret = cfEnv.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;
  const toEmail = cfEnv.RESEND_TO_EMAIL || import.meta.env.RESEND_TO_EMAIL || "helmiarimbawa46@gmail.com";

  // Verifikasi Turnstile
  const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const turnstileResponse = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: turnstileSecret || "",
      response: turnstileToken,
    }),
  });

  const turnstileResult = (await turnstileResponse.json()) as { success: boolean };
  if (!turnstileResult.success) {
    return c.json({ error: "Captcha verification failed" }, 400);
  }

  if (!resendApiKey) {
    return c.json({ error: "Email service configuration missing" }, 500);
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
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true, message: "Email sent successfully", data });
});

export type AppType = typeof app;
export const ALL = async (context: any) => {
  return app.fetch(context.request, context.locals);
};
