# Panduan Cloudflare KV (Key-Value) Namespace

Dokumen ini berisi daftar perintah (*cheat sheet*) lengkap untuk mengelola data di Cloudflare KV Namespace baik untuk environment Lokal maupun Remote (Cloud).

---

## 1. Perintah Manajemen KV (Menggunakan Wrangler CLI)

Gunakan perintah di bawah ini untuk memanipulasi data di Cloudflare KV. Ganti `prod-web-porto` dengan binding KV Anda jika berbeda.

### A. Untuk Database LOKAL (Emulator)
Tambahkan flag `--local` di setiap perintah untuk mengelola data di komputer lokal Anda (disimpan di folder `.wrangler/state/v3/kv`).

* **Menambah / Mengubah Data:**
  ```bash
  bunx wrangler kv key put --binding=prod-web-porto --local "NAMA_KEY" "NILAI_KEY"
  ```
  *Contoh:* `bunx wrangler kv key put --binding=prod-web-porto --local "site:email" "helmiari@example.com"`

* **Membaca Data:**
  ```bash
  bunx wrangler kv key get --binding=prod-web-porto --local "NAMA_KEY"
  ```
  *Contoh:* `bunx wrangler kv key get --binding=prod-web-porto --local "site:email"`

* **Melihat/Mendaftar Semua Key:**
  ```bash
  bunx wrangler kv key list --binding=prod-web-porto --local
  ```

* **Menghapus Data:**
  ```bash
  bunx wrangler kv key delete --binding=prod-web-porto --local "NAMA_KEY"
  ```

---

### B. Untuk Database REMOTE (Cloud / Produksi)
Gunakan flag `--remote` (atau hapus `--local` jika menggunakan versi wrangler terbaru) untuk memanipulasi data di Cloudflare Cloud secara langsung.

* **Menambah / Mengubah Data:**
  ```bash
  bunx wrangler kv key put --binding=prod-web-porto --remote "NAMA_KEY" "NILAI_KEY"
  ```

* **Membaca Data:**
  ```bash
  bunx wrangler kv key get --binding=prod-web-porto --remote "NAMA_KEY"
  ```

* **Melihat/Mendaftar Semua Key:**
  ```bash
  bunx wrangler kv key list --binding=prod-web-porto --remote
  ```

* **Menghapus Data:**
  ```bash
  bunx wrangler kv key delete --binding=prod-web-porto --remote "NAMA_KEY"
  ```

---

## 2. Cara Menghubungkan Lokal ke KV Remote Secara Langsung

Jika Anda malas menyinkronkan data secara manual, Anda bisa mengarahkan server local development Anda agar selalu membaca dan menulis data langsung ke Cloudflare KV Remote secara *real-time*.

Tambahkan properti `experimental_remote = true` di file `wrangler.toml` Anda pada binding KV terkait:

```toml
[[kv_namespaces]]
binding = "prod-web-porto"
id = "76bea9b089d24d238e818a3059b511ee"
experimental_remote = true # 👈 Aktifkan ini
```
*Dengan cara ini, saat menjalankan `bun run preview`, aplikasi Anda akan langsung berinteraksi dengan KV Cloud/Remote dan mengabaikan data KV lokal.*
