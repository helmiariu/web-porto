import type { APIRoute } from "astro";
import { getCfEnv } from "@/lib/cloudflare";

export const GET: APIRoute = async ({ params, request }) => {
  const fileKey = params.key;
  if (!fileKey) {
    return new Response("Not Found", { status: 404 });
  }

  // 1. Coba ambil dari Cloudflare Cache API (Edge CDN) jika tersedia
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  let cache: any;
  try {
    cache = (caches as any).default;
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (e) {
    // Caches tidak tersedia di env Node dev lokal biasa, lanjut tanpa cache cdn
  }

  // 2. Ambil dari R2 Bucket
  const cfEnv = getCfEnv();
  const bucket = cfEnv.GALLERY_BUCKET;
  if (!bucket) {
    return new Response("R2 Bucket binding GALLERY_BUCKET not configured", { status: 500 });
  }

  const object = await bucket.get(fileKey);
  if (!object) {
    return new Response("File Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  
  // Set cache control untuk Browser (max-age) & Cloudflare CDN (s-maxage) selama 1 tahun
  headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000");

  // Deteksi Tipe Konten Khusus
  if (fileKey.endsWith(".glb")) {
    headers.set("Content-Type", "model/gltf-binary");
  } else if (fileKey.endsWith(".svg")) {
    headers.set("Content-Type", "image/svg+xml");
  }

  const response = new Response(object.body, { headers });

  // 3. Simpan ke CDN Cache jika statusnya 200
  if (response.status === 200 && cache) {
    try {
      await cache.put(cacheKey, response.clone());
    } catch (e) {
      // Abaikan error penyimpanan cache di lokal
    }
  }

  return response;
};
