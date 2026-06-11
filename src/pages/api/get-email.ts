import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const GET: APIRoute = async () => {
    const cfEnv = env as any;
    const email = await cfEnv["prod-web-porto"].get("site:email");

    return new Response(JSON.stringify({ email }), {
        headers: { "Content-Type": "application/json" },
    });
};
