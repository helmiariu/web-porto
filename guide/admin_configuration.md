# Panduan Konfigurasi Admin Database D1

Setelah melakukan migrasi database dan melakukan login pertama kali ke dalam aplikasi portfolio, akun Anda perlu diberikan role `admin` agar Anda dapat mengakses halaman administratif (`/admin`).

Berikut adalah perintah SQL untuk mengubah status user menjadi admin di database D1 lokal dan remote:

---

## 1. Database LOKAL (Development/Preview)

Pastikan Anda sudah masuk/login terlebih dahulu di server lokal (`bun run preview`). Setelah akun terbuat di database lokal, jalankan perintah ini di terminal:

```bash
bunx wrangler d1 execute prod-porto-db --command="UPDATE users SET role = 'admin' WHERE email = 'email-anda@gmail.com';"
```

> [!NOTE]  
> Ganti `email-anda@gmail.com` dengan email yang Anda gunakan saat login lokal (misal Google/GitHub).

---

## 2. Database REMOTE (Cloud/Produksi)

### Kasus A: Akun Sudah Terdaftar (Telah Login via OAuth Sebelumnya)
Jika akun email Anda sudah ada di database (misalnya Anda pernah login lewat Google/GitHub sebelumnya), Anda hanya perlu memperbarui status `role` menjadi `admin`:
```bash
bunx wrangler d1 execute prod-porto-db --remote --command="UPDATE users SET role = 'admin' WHERE email = 'email-anda@gmail.com';"
```

### Kasus B: Menggunakan Cloudflare Access (Akun Belum Ada di Database)
Jika Anda masuk melalui **Cloudflare Access (Zero Trust)**, aplikasi membaca email dari header request. Namun, karena Anda tidak melalui alur pendaftaran standard (Auth.js), **baris data email Anda belum ada di tabel `users`**.

Oleh karena itu, perintah `UPDATE` di atas tidak akan membuahkan hasil. Anda harus **memasukkan (INSERT) akun Anda terlebih dahulu** ke dalam tabel `users` di D1 Remote, kemudian memastikan rolenya adalah `admin`:

1. **Jalankan Perintah INSERT & UPDATE Gabungan (Ganti email dengan email Cloudflare Access Anda):**
   ```bash
   bunx wrangler d1 execute prod-porto-db --remote --command="INSERT OR IGNORE INTO users (id, name, email, role) VALUES ('cf_access_admin', 'Admin Cloudflare', 'email-anda@gmail.com', 'admin'); UPDATE users SET role = 'admin' WHERE email = 'email-anda@gmail.com';"
   ```

2. **Verifikasi Apakah Data Sudah Masuk dengan Benar:**
   ```bash
   bunx wrangler d1 execute prod-porto-db --remote --command="SELECT * FROM users;"
   ```
   *Pastikan email Anda sudah terdaftar dengan kolom `role` bernilai `admin`.*
