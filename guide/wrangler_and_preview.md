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

### Perbandingan Mode Development (Wrangler v4)

Berikut adalah ringkasan perbedaan mode development yang tersedia di Wrangler v4:

| Mode | Kode Worker | Binding | Perintah |
| :--- | :--- | :--- | :--- |
| **Lokal default** | Lokal | Simulasi lokal (data kosong / lokal) | `wrangler dev` / `bun run preview` |
| **Remote bindings** | Lokal | Terhubung ke Cloudflare (real data) | `wrangler dev` (dengan `remote = true` pada binding) |
| **Remote penuh** | Cloudflare (upload) | Semua ke Cloudflare | `wrangler dev --remote` |

---

### Cara C: Menggunakan Remote Bindings (Mode yang Direkomendasikan)
Jika Anda ingin menjalankan kode secara lokal dengan hot-reload cepat, tetapi ingin binding tertentu (misal KV) langsung membaca/menulis data asli di Cloudflare:
1. Pastikan Anda sudah menambahkan `remote = true` pada binding yang diinginkan di `wrangler.toml`.
2. Jalankan server lokal seperti biasa:
   ```bash
   bun run preview
   ```

### Cara D: Menggunakan Mode Remote Penuh (Legacy / Full Remote)
Jika Anda ingin mengunggah kode lokal Anda langsung untuk dijalankan di Cloudflare Workers dev sandbox (semua resource terhubung ke Cloudflare):
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
> Berhati-hatilah saat menggunakan mode remote bindings maupun remote penuh, karena semua operasi baca/tulis yang Anda lakukan dari browser lokal Anda akan langsung mengubah data asli yang aktif di server produksi Cloudflare (D1 & KV).


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
