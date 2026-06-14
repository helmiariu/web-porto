import { Hono } from "hono";
import { getKV, getCfEnv, getDB } from "@/lib/cloudflare";
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

import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users, softwareTools, albumMetadata } from "../../db/schema";

// Helper check admin
const isAdmin = async (c: any) => {
  const isLocalhost = c.req.header("host")?.includes("localhost") || 
                      c.req.header("host")?.includes("127.0.0.1") || 
                      c.req.header("host")?.includes("8787");
  
  let email = c.req.header("Cf-Access-Authenticated-User-Email");
  if (!email) {
     try {
       const { getSession } = await import("auth-astro/server");
       const session = await getSession(c.req.raw);
       email = session?.user?.email;
     } catch (e) {}
  }

  if (isLocalhost && !email) {
     return true; // Dev bypass
  }

  if (!email) return false;

  const rawDb = getDB();
  const db = drizzle(rawDb);
  const adminUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return adminUser.length > 0 && adminUser[0].role === "admin";
};

// --- REST API ADMIN: SOFTWARE TOOLS ---

// 1. GET /api/admin/software
app.get("/admin/software", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const rawDb = getDB();
  const db = drizzle(rawDb);
  const list = await db.select().from(softwareTools);
  return c.json(list);
});

// 2. POST /api/admin/software
app.post("/admin/software", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.parseBody();
  const name = body.name as string;
  const slug = body.slug as string;
  const iconType = body.iconType as string; // "iconify" | "custom_r2"
  const color = body.color as string;
  let iconValue = body.iconValue as string;
  const file = body.file as File;

  if (!name || !slug || !iconType) {
    return c.json({ error: "Missing fields" }, 400);
  }

  if (iconType === "custom_r2" && file) {
    const cfEnv = getCfEnv();
    const bucket = cfEnv.GALLERY_BUCKET;
    if (!bucket) return c.json({ error: "R2 bucket not bound" }, 500);

    const r2Key = `assets/icons/${slug}.svg`;
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: "image/svg+xml" }
    });
    iconValue = r2Key;
  }

  const rawDb = getDB();
  const db = drizzle(rawDb);
  await db.insert(softwareTools).values({
    name,
    slug,
    iconType,
    iconValue,
    color: color || null,
  });

  return c.json({ success: true });
});

// 3. PUT /api/admin/software/:id
app.put("/admin/software/:id", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const { name, slug, iconType, iconValue, color } = body;

  const rawDb = getDB();
  const db = drizzle(rawDb);
  await db.update(softwareTools)
    .set({
      name,
      slug,
      iconType,
      iconValue,
      color: color || null,
    })
    .where(eq(softwareTools.id, id));

  return c.json({ success: true });
});

// 4. DELETE /api/admin/software/:id
app.delete("/admin/software/:id", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const id = parseInt(c.req.param("id"));
  const rawDb = getDB();
  const db = drizzle(rawDb);
  await db.delete(softwareTools).where(eq(softwareTools.id, id));
  return c.json({ success: true });
});

// --- REST API ADMIN: ALBUMS & FILE MANAGEMENT ---

// 5. GET /api/admin/albums (Merge D1 & R2)
app.get("/admin/albums", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const cfEnv = getCfEnv();
  const bucket = cfEnv.GALLERY_BUCKET;
  if (!bucket) return c.json({ error: "R2 bucket GALLERY_BUCKET not bound" }, 500);

  const rawDb = getDB();
  const db = drizzle(rawDb);

  const allSoftware = await db.select().from(softwareTools);
  const allMeta = await db.select().from(albumMetadata);
  const metaMap = new Map(allMeta.map((m) => [m.albumSlug, m]));

  const response = await bucket.list({ prefix: "assets/3Dgallery/" });
  
  const albums: Record<string, {
    albumSlug: string;
    title: string;
    files: Array<{ key: string; name: string; size: number }>;
    softwareList: string[];
  }> = {};

  for (const obj of response.objects) {
    const key = obj.key;
    const parts = key.split("/");
    if (parts.length >= 4) {
      const albumSlug = parts[2];
      const name = parts[3];
      if (!albumSlug) continue;

      if (!albums[albumSlug]) {
        const dbMeta = metaMap.get(albumSlug);
        let swList: string[] = [];
        if (dbMeta) {
          try {
            swList = JSON.parse(dbMeta.softwareList);
          } catch(e) {}
        }
        albums[albumSlug] = {
          albumSlug,
          title: dbMeta?.title || albumSlug.replace(/-/g, " "),
          files: [],
          softwareList: swList,
        };
      }

      albums[albumSlug].files.push({
        key,
        name,
        size: obj.size,
      });
    }
  }

  return c.json({
    albums: Object.values(albums),
    softwareTools: allSoftware,
  });
});

// 6. POST /api/admin/albums/metadata (Upsert)
app.post("/admin/albums/metadata", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { albumSlug, title, softwareList } = body;

  const rawDb = getDB();
  const db = drizzle(rawDb);
  const existing = await db.select().from(albumMetadata).where(eq(albumMetadata.albumSlug, albumSlug)).limit(1);

  const swJson = JSON.stringify(softwareList || []);

  if (existing.length > 0) {
    await db.update(albumMetadata)
      .set({ title, softwareList: swJson })
      .where(eq(albumMetadata.albumSlug, albumSlug));
  } else {
    await db.insert(albumMetadata).values({
      albumSlug,
      title,
      softwareList: swJson,
    });
  }

  return c.json({ success: true });
});

// 7. POST /api/admin/albums/upload (Upload file to R2)
app.post("/admin/albums/upload", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const cfEnv = getCfEnv();
  const bucket = cfEnv.GALLERY_BUCKET;
  if (!bucket) return c.json({ error: "R2 bucket not bound" }, 500);

  const body = await c.req.parseBody();
  const albumSlug = body.albumSlug as string;
  const file = body.file as File;

  if (!albumSlug || !file) {
    return c.json({ error: "Missing albumSlug or file" }, 400);
  }

  const fileName = file.name.replace(/[^a-zA-Z0-9.\-_ ()]/g, "");
  const r2Key = `assets/3Dgallery/${albumSlug}/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();
  
  await bucket.put(r2Key, arrayBuffer, {
    httpMetadata: { contentType: file.type }
  });

  return c.json({ success: true, key: r2Key });
});

// 8. POST /api/admin/albums/delete-file
app.post("/admin/albums/delete-file", async (c) => {
  const authorized = await isAdmin(c);
  if (!authorized) return c.json({ error: "Unauthorized" }, 401);

  const cfEnv = getCfEnv();
  const bucket = cfEnv.GALLERY_BUCKET;
  if (!bucket) return c.json({ error: "R2 bucket not bound" }, 500);

  const body = await c.req.json();
  const { key } = body;

  if (!key) return c.json({ error: "Missing key" }, 400);

  await bucket.delete(key);
  return c.json({ success: true });
});

export type AppType = typeof app;
export const ALL = async (context: any) => {
  return app.fetch(context.request, context.locals);
};
