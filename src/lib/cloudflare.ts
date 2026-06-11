import { env } from "cloudflare:workers";

/**
 * Mendapatkan object env Cloudflare yang terikat pada runtime worker.
 */
export function getCfEnv() {
    return env as any;
}

/**
 * Mendapatkan KV Namespace untuk data dinamis (rate limit, CV link, email, dll).
 * Mengembalikan binding "prod-web-porto" atau fallback ke "RATE_LIMIT_KV".
 */
export function getKV() {
    const cfEnv = getCfEnv();
    return cfEnv["prod-web-porto"] || cfEnv["dev_kv"] || cfEnv.RATE_LIMIT_KV;
}

/**
 * Mendapatkan D1 Database untuk autentikasi dan database utama.
 * Mengembalikan binding "prod-porto-db" atau fallback ke "DB".
 */
export function getDB() {
    const cfEnv = getCfEnv();
    return cfEnv["DB"] || cfEnv.DB;
}

/**
 * Mendapatkan API Key Gemini dari environment.
 */
export function getGeminiApiKey(): string {
    return getCfEnv().GEMINI_API_KEY;
}
