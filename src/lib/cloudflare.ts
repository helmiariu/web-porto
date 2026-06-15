let workerEnv: any = {};
try {
    // @ts-ignore
    const workers = await import("cloudflare:workers");
    workerEnv = workers.env;
} catch (e) {
    // Fallback untuk local Node.js dev mode
    workerEnv = {};
}

/**
 * Mendapatkan object env Cloudflare yang terikat pada runtime worker.
 */
export function getCfEnv() {
    return workerEnv;
}

/**
 * Fallback Mock KV Namespace untuk development lokal (Node.js)
 */
const mockKV = {
    isMock: true,
    get: async (key: string, type?: string) => {
        console.warn(`[Local Mock KV] Reading key: "${key}"`);
        return null;
    },
    put: async (key: string, value: string, options?: any) => {
        console.warn(`[Local Mock KV] Writing key: "${key}" with value: "${value}"`);
    },
    delete: async (key: string) => {
        console.warn(`[Local Mock KV] Deleting key: "${key}"`);
    }
};

/**
 * Fallback Mock D1 Database untuk development lokal (Node.js)
 */
const mockDB = {
    isMock: true,
    prepare: (sql: string) => {
        console.warn(`[Local Mock DB] Preparing statement: "${sql}"`);
        const executor = () => ({
            run: async () => ({ success: true, results: [], meta: {} }),
            all: async () => ({ success: true, results: [] }),
            first: async () => null,
            raw: async () => [],
        });
        return {
            bind: (...args: any[]) => {
                console.warn(`[Local Mock DB] Binding parameters:`, args);
                return executor();
            },
            ...executor()
        };
    }
};

/**
 * Mendapatkan KV Namespace untuk data dinamis (rate limit, CV link, email, dll).
 * Mengembalikan binding "prod-web-porto" atau fallback ke "RATE_LIMIT_KV".
 */
export function getKV() {
    const cfEnv = getCfEnv();
    const kv = cfEnv["prod-web-porto"] || cfEnv["dev_kv"] || cfEnv.RATE_LIMIT_KV;
    return kv || mockKV;
}

/**
 * Mendapatkan D1 Database untuk autentikasi dan database utama.
 * Mengembalikan binding "prod-porto-db" atau fallback ke "DB".
 */
export function getDB() {
    const cfEnv = getCfEnv();
    const db = cfEnv["DB"] || cfEnv.DB;
    return db || mockDB;
}

/**
 * Mendapatkan API Key Gemini dari environment.
 */
export function getGeminiApiKey(): string {
    const cfEnv = getCfEnv();
    return cfEnv.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
}
