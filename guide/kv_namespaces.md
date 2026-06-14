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

## 2. Cara Menghubungkan Lokal ke KV Remote Secara Langsung (Remote Bindings)

Remote bindings di Wrangler v4 memungkinkan Worker Anda berjalan secara lokal di mesin Anda (lebih cepat, hot-reload instan), tetapi binding KV Anda tetap terhubung ke resource asli di Cloudflare.

### Kenapa `experimental_remote` Error?
Field `experimental_remote` adalah konfigurasi lama dari versi beta remote bindings (Juni 2025). Saat ini, remote bindings sudah GA (General Availability, September 2025) dan field tersebut digantikan dengan **`remote = true`**.

### Konfigurasi yang Benar untuk KV
Tambahkan properti `remote = true` di file `wrangler.toml` Anda pada binding KV terkait:

```toml
[[kv_namespaces]]
binding = "prod-web-porto"
id = "76bea9b089d24d238e818a3059b511ee"
remote = true # 👈 Aktifkan ini
```

Lalu jalankan server development seperti biasa:
```bash
bun run preview
```
*(atau `bunx wrangler dev` jika di luar Astro preview)*

### Apa yang Terjadi di Balik Layar?
* Kode Worker Anda dieksekusi secara lokal (menggunakan Miniflare).
* Saat kode memanggil `env.prod-web-porto.get()`, request secara otomatis di-proxy ke namespace KV yang sesungguhnya di Cloudflare.
* Data yang dibaca/ditulis adalah data riil dari Cloudflare, namun proses iterasi kode tetap sangat cepat karena tidak perlu melakukan proses upload kode ke Cloudflare.

### Catatan Penting
* **`preview_id` tidak diperlukan** saat menggunakan remote bindings. Dokumentasi menyebutkan `preview_id` hanya wajib jika menggunakan mode legacy `wrangler dev --remote`.
* Jika ingin memaksa mode lokal murni (tanpa remote bindings) meskipun `remote = true` terpasang di config, jalankan dengan:
  ```bash
  bunx wrangler dev --local
  ```
* Jika Anda memiliki banyak binding (KV, R2, D1, dll.) dan hanya ingin KV yang remote, Anda cukup menyetel `remote = true` **hanya** pada binding KV tersebut. Binding lainnya (seperti D1) akan tetap menggunakan simulasi lokal.

