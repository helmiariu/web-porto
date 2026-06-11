import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
    const env = context.locals.runtime.env;
    const email = await env["prod-web-porto"].get("site:email");

    return new Response(JSON.stringify({ email }), {
        headers: { "Content-Type": "application/json" },
    });
};
