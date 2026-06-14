# Panduan Drizzle ORM & Cloudflare D1 Database

Dokumen ini berisi panduan untuk mengelola skema database relational menggunakan Drizzle ORM dan mengeksekusinya ke database Cloudflare D1 (Lokal & Remote).

---

## 1. Perintah Migrasi Drizzle

Skema database didefinisikan dalam file TypeScript di [src/db/schema.ts](file:///f:/Career/Web%20Design/porto-astro/web-porto/src/db/schema.ts). Jika Anda memodifikasi skema tersebut, ikuti langkah-langkah di bawah ini:

### Langkah A: Generate File SQL Migrasi
Buat file migrasi SQL baru secara otomatis berdasarkan skema TypeScript Anda:
```bash
bunx drizzle-kit generate
```
*File migrasi akan disimpan di folder `drizzle/`.*

### Langkah B: Terapkan Migrasi ke Database D1
Setelah migrasi digenerate, terapkan file SQL tersebut ke database D1 Anda:

* **Untuk D1 LOKAL (Emulator):**
  ```bash
  bunx wrangler d1 migrations apply prod-porto-db
  ```
* **Untuk D1 REMOTE (Cloud/Produksi):**
  ```bash
  bunx wrangler d1 migrations apply prod-porto-db --remote
  ```

---

## 2. Cheat Sheet Perintah Database D1 (Wrangler SQL)

Jika Anda ingin menjalankan query SQL langsung tanpa menulis kode program:

### A. Database REMOTE (Cloud)
| Aksi | Perintah Wrangler / Bunx |
| :--- | :--- |
| **Membuat Tabel dari Skema Mentah** | `bunx wrangler d1 execute prod-porto-db --remote --file=db/schema.sql` |
| **Menghapus Seluruh Isi Data Tabel** | `bunx wrangler d1 execute prod-porto-db --remote --command="DELETE FROM sessions; DELETE FROM accounts; DELETE FROM users;"` |
| **Menghapus (Drop) Semua Tabel** | `bunx wrangler d1 execute prod-porto-db --remote --command="DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS accounts; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS verification_tokens; DROP TABLE IF EXISTS web_analytics; DROP TABLE IF EXISTS ai_chat_messages;"` |
| **Menjalankan Query SQL Kustom** | `bunx wrangler d1 execute prod-porto-db --remote --command="SELECT * FROM users;"` |

### B. Database LOKAL (Emulator)
Cukup jalankan perintah yang sama **tanpa** flag `--remote`:
* **Menghapus Semua Tabel Lokal:**
  ```bash
  bunx wrangler d1 execute prod-porto-db --command="DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS accounts; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS verification_tokens; DROP TABLE IF EXISTS web_analytics; DROP TABLE IF EXISTS ai_chat_messages;"
  ```
* **Cara Cepat Menghapus DB Lokal (Tanpa Sebutkan Tabel):**
  Hapus folder data SQLite emulator lokal:
  * **Windows (PowerShell)**: `Remove-Item -Recurse -Force .wrangler/state/v3/d1`
  * **macOS / Linux**: `rm -rf .wrangler/state/v3/d1`

---

## 3. Alur Sinkronisasi Data Remote D1 ke Lokal

Ikuti langkah ini jika ingin isi database lokal Anda persis sama dengan database produksi remote:

1. **Ekspor Data dari Remote D1:**
   ```bash
   bunx wrangler d1 export prod-porto-db --remote --output=db-remote-dump.sql
   ```
2. **Hapus Tabel Lama di Lokal:**
   ```bash
   bunx wrangler d1 execute prod-porto-db --command="DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS accounts; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS verification_tokens; DROP TABLE IF EXISTS web_analytics; DROP TABLE IF EXISTS ai_chat_messages;"
   ```
3. **Impor File SQL ke Lokal:**
   ```bash
   bunx wrangler d1 execute prod-porto-db --file=db-remote-dump.sql
   ```
4. **Hapus File Dump Sementara:**
   * **PowerShell**: `Remove-Item db-remote-dump.sql`
   * **Bash**: `rm db-remote-dump.sql`

---

## 4. Menggunakan Drizzle Studio (Database GUI)

Untuk melihat dan mengelola data tabel secara visual lewat browser:
```bash
bunx drizzle-kit studio
```
*Antarmuka Web GUI akan terbuka (biasanya di `https://local.drizzle.studio`). Anda dapat menambah, mengubah, dan menghapus record data secara mudah.*
