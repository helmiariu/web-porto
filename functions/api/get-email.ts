interface Env {
    "prod-web-porto": KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const email = await context.env["prod-web-porto"].get("site:email");

    return new Response(JSON.stringify({ email }), {
        headers: { "Content-Type": "application/json" },
    });
};