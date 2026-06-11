import type { APIRoute } from "astro";
import { getKV } from "@lib/cloudflare";

export const GET: APIRoute = async () => {
    const kv = getKV();
    const email = await kv.get("site:email");

    return new Response(JSON.stringify({ email }), {
        headers: { "Content-Type": "application/json" },
    });
};

