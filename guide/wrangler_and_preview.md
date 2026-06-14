# Panduan Menjalankan Project & Deployment

Dokumen ini menjelaskan cara menjalankan server local development (baik dengan mode cepat maupun dengan emulator Cloudflare) serta alur deploy aplikasi Anda ke Cloudflare Workers.

---

## 1. Menjalankan Project di Local Development

Karena project ini menggunakan binding Cloudflare (D1 Database dan KV Namespace), ada dua cara untuk menjalankan server lokal:

### Cara A: Menggunakan Astro Dev (Mode Cepat, Tanpa Database Fisik/Mock)
Menjalankan server Astro standar menggunakan Node.js.
```bash
bun run dev
```
* **Kelebihan**: Sangat cepat untuk mengubah tampilan UI, style CSS, dan layout.
* **Kekurangan**: Fitur database D1 dan KV tidak aktif secara penuh (akan menggunakan fallback/warning di terminal berupa mock data).

### Cara B: Menggunakan Wrangler Dev (Mendukung Database D1 & KV Lokal)
Jika ingin menguji alur autentikasi dan database secara lokal:
1. Lakukan build project terlebih dahulu:
   ```bash
   bun run build
   ```
2. Jalankan server lokal menggunakan Wrangler (Cloudflare emulator):
   ```bash
   bun run preview
   ```
   *Perintah ini akan menjalankan emulator Wrangler yang membaca konfigurasi di `.wrangler` dan mengaktifkan D1 / KV lokal.*

### Cara C: Menggunakan Wrangler Dev dengan Mode Remote Penuh (Mendukung D1 & KV Remote/Produksi Langsung)
Jika Anda ingin kode program lokal Anda berjalan namun langsung terhubung dengan database D1 dan KV asli di cloud (produksi):
1. Lakukan build project terlebih dahulu:
   ```bash
   bun run build
   ```
2. Jalankan server lokal dengan flag `--remote`:
   ```bash
   bun run preview -- --remote
   ```
   *(Atau secara alternatif: `bunx wrangler dev --remote`)*

> [!WARNING]  
> Berhati-hatilah saat menggunakan mode `--remote` ini, karena semua operasi baca/tulis yang Anda lakukan dari browser lokal Anda akan langsung mengubah data asli yang aktif di server produksi Cloudflare (D1 & KV).

---

## 2. Alur Kerja Deployment Manual

Jika Anda melakukan perubahan pada kode program (misalnya file `.astro`, `.tsx`, `.css`) dan ingin men-deploy-nya ke Cloudflare secara manual:

1. **Kompilasi kode program (Wajib):**
   ```bash
   bun run build
   ```
2. **Deploy ke Cloudflare Workers:**
   ```bash
   bunx wrangler deploy --name auth-web-porto
   ```

---

## 3. Troubleshooting Autentikasi

* **Error `OAuthAccountNotLinked`**: Terjadi ketika email yang sama mencoba masuk menggunakan provider yang berbeda (misal pertama daftar pakai Google, lalu coba login pakai GitHub). 
* **Solusi**: Pastikan `allowDangerousEmailAccountLinking: true` aktif pada konfigurasi provider di `auth.config.ts`, atau bersihkan isi tabel database terlebih dahulu dengan perintah hapus untuk mulai dari awal.
