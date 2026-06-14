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

Setelah Anda men-deploy aplikasi dan melakukan login pertama kali di URL produksi asli, jalankan perintah ini untuk memberikan akses admin di database remote:

```bash
bunx wrangler d1 execute prod-porto-db --remote --command="UPDATE users SET role = 'admin' WHERE email = 'email-anda@gmail.com';"
```

> [!IMPORTANT]  
> Pastikan email yang ditulis sama persis dengan email yang terdaftar di sistem otentikasi produksi Anda.
