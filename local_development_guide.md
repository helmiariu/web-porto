# Panduan Local Development & Database D1

Dokumen ini berisi panduan untuk menjalankan project secara lokal (development mode) serta daftar perintah (*cheat sheet*) penting untuk mengelola database D1 (lokal & remote) dan deployment.

---

## 1. Menjalankan Project di Local Development

Karena project ini menggunakan binding Cloudflare (D1 Database dan KV Namespace), ada dua cara untuk menjalankan server lokal:

### Cara A: Menggunakan Astro Dev (Mode Cepat, Tanpa Database Fisik/Mock)
Menjalankan server Astro standar menggunakan Node.js.
```bash
bun run dev
```
* **Kelebihan**: Sangat cepat untuk mengubah tampilan UI, style CSS, dan layout.
* **Kekurangan**: Fitur database D1 dan KV tidak aktif secara penuh (akan menggunakan fallback/warning di terminal).

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

---

## 2. Cheat Sheet Perintah Database D1 (Cloudflare)

D1 memiliki dua environment: **Lokal (Local Emulator)** dan **Remote (Production/Cloudflare Cloud)**.

### A. Untuk Database REMOTE (Cloud/Produksi)

| Aksi | Perintah Wrangler / Bunx |
| :--- | :--- |
| **Membuat Tabel Baru** | `bunx wrangler d1 execute prod-porto-db --remote --file=db/schema.sql` |
| **Menghapus Seluruh Isi Data Tabel** | `bunx wrangler d1 execute prod-porto-db --remote --command="DELETE FROM sessions; DELETE FROM accounts; DELETE FROM users;"` |
| **Menghapus/Drop Semua Tabel** | `bunx wrangler d1 execute prod-porto-db --remote --command="DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS accounts; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS verification_tokens; DROP TABLE IF EXISTS web_analytics;"` |
| **Menjalankan Query SQL Kustom** | `bunx wrangler d1 execute prod-porto-db --remote --command="SELECT * FROM users;"` |

### B. Untuk Database LOKAL (Development Emulator)

Saat Anda menjalankan `bun run preview`, database lokal disimpan di folder `.wrangler/`. Gunakan perintah di bawah ini **tanpa** flag `--remote`:

| Aksi | Perintah Wrangler / Bunx |
| :--- | :--- |
| **Membuat Tabel Baru di Lokal** | `bunx wrangler d1 execute prod-porto-db --file=db/schema.sql` |
| **Menghapus Isi Data Tabel Lokal** | `bunx wrangler d1 execute prod-porto-db --command="DELETE FROM sessions; DELETE FROM accounts; DELETE FROM users;"` |
| **Menghapus/Drop Semua Tabel Lokal** | `bunx wrangler d1 execute prod-porto-db --command="DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS accounts; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS verification_tokens; DROP TABLE IF EXISTS web_analytics;"` |
| **Melihat Data User di Lokal** | `bunx wrangler d1 execute prod-porto-db --command="SELECT * FROM users;"` |

---

## 3. Alur Kerja Deployment Manual

Jika Anda melakukan perubahan pada kode program (misalnya file `.astro`, `.tsx`, `.css`) dan ingin men-deploy-nya ke Cloudflare:

1. **Kompilasi kode program (Wajib):**
   ```bash
   bun run build
   ```
2. **Deploy ke Cloudflare Workers:**
   ```bash
   bunx wrangler deploy --name auth-web-porto
   ```

---

## 4. Troubleshooting Autentikasi

* **Error `OAuthAccountNotLinked`**: Terjadi ketika email yang sama mencoba masuk menggunakan provider yang berbeda (misal pertama daftar pakai Google, lalu coba login pakai GitHub). Solusinya adalah dengan memastikan `allowDangerousEmailAccountLinking: true` aktif pada konfigurasi provider, atau bersihkan isi tabel database terlebih dahulu dengan perintah hapus di atas untuk mulai dari awal.
