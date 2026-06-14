# Panduan Sinkronisasi Data Lokal ke Remote & Rangkuman Perintah Penting

Dokumen ini berisi rangkuman perintah CLI penting selama pengembangan proyek dan panduan langkah demi langkah untuk menyinkronkan data database **D1**, storage **R2**, dan **KV Namespace** dari emulator lokal ke server produksi Cloudflare secara aman tanpa merusak atau menghapus data yang sudah ada di remote.

---

## 1. Rangkuman Perintah CLI Penting

Berikut adalah rangkuman perintah yang sering digunakan selama pengembangan dan pengujian proyek ini:

### A. Menjalankan Aplikasi & Preview
| Perintah | Fungsi |
| :--- | :--- |
| `bun run dev` | Menjalankan Astro local development server (tanpa database D1/KV riil). |
| `bun run build` | Melakukan kompilasi/build proyek Astro untuk serverless Cloudflare Workers. |
| `bun run preview` | Menjalankan emulator lokal Wrangler menggunakan data emulator `.wrangler/`. |
| `bun run preview -- --local` | Menjalankan emulator Wrangler dengan memaksa binding lokal. |
| `bun run preview -- --remote` | Menjalankan preview lokal namun terhubung penuh ke resource Cloudflare remote. |

### B. Database D1 & Drizzle ORM
| Perintah | Fungsi |
| :--- | :--- |
| `bunx drizzle-kit generate` | Membuat file migrasi SQL baru berdasarkan perubahan skema di `schema.ts`. |
| `bunx wrangler d1 migrations apply prod-porto-db` | Menerapkan migrasi Drizzle ke database D1 lokal. |
| `bunx wrangler d1 migrations apply prod-porto-db --remote` | Menerapkan migrasi Drizzle ke database D1 remote produksi. |
| `bunx wrangler d1 export prod-porto-db --local --output=local.sql` | Mengekspor seluruh skema dan isi data D1 lokal ke file SQL. |
| `bunx wrangler d1 execute prod-porto-db --remote --file=query.sql` | Mengeksekusi query dari file SQL ke database D1 remote. |
| `bunx wrangler d1 execute prod-porto-db --remote --command="SQL_QUERY"` | Mengeksekusi satu baris query SQL langsung ke D1 remote. |
| `bunx drizzle-kit studio` | Membuka antarmuka web GUI Drizzle Studio untuk mengelola tabel. |

### C. Cloudflare KV Namespace
| Perintah | Fungsi |
| :--- | :--- |
| `bunx wrangler kv key put --binding=prod-web-porto --local "KEY" "VAL"` | Menyimpan key-value ke emulator KV lokal. |
| `bunx wrangler kv key put --binding=prod-web-porto --remote "KEY" "VAL"` | Menyimpan key-value langsung ke Cloudflare KV remote. |
| `bunx wrangler kv key list --binding=prod-web-porto --local` | Mendaftar semua key yang ada di KV lokal. |
| `bunx wrangler kv key list --binding=prod-web-porto --remote` | Mendaftar semua key yang ada di KV remote. |

---

## 2. Sinkronisasi Database D1 (Lokal ➡️ Remote) Secara Aman

Jika Anda ingin memindahkan data hasil seeding atau penambahan di lokal ke database produksi remote, tetapi tidak ingin menimpa data yang sudah ada di remote, lakukan alur berikut:

### Langkah 1: Ekspor Data Lokal ke File SQL
Jalankan perintah berikut untuk mengekspor data dari D1 lokal ke sebuah file SQL sementara:
```bash
bunx wrangler d1 export prod-porto-db --local --output=local_data_dump.sql
```

### Langkah 2: Modifikasi File SQL (Wajib)
Buka file `local_data_dump.sql` menggunakan text editor Anda. Lakukan penyesuaian agar tidak terjadi bentrokan saat dieksekusi di remote:
1. **Hapus baris `CREATE TABLE`** jika tabel tersebut sudah ada di database remote (remote schema Anda harusnya sudah terupdate menggunakan migrasi Drizzle).
2. **Ubah `INSERT INTO` menjadi `INSERT OR IGNORE INTO`**:
   - Cari semua teks `INSERT INTO` dan ganti menjadi `INSERT OR IGNORE INTO`.
   - Hal ini memastikan jika di database remote sudah terdapat record dengan Primary Key atau constraint UNIQUE yang sama, perintah impor **tidak akan error** dan **tidak akan menimpa** data remote tersebut. Data lokal yang benar-benar baru saja yang akan ditambahkan ke remote.
   - *Alternatif:* Jika Anda ingin data lokal menimpa data remote yang duplikat, gunakan `INSERT OR REPLACE INTO`.

### Langkah 3: Eksekusi SQL ke Database Remote
Jalankan perintah ini untuk mengimpor data yang sudah difilter ke database Cloudflare D1 produksi Anda:
```bash
bunx wrangler d1 execute prod-porto-db --remote --file=local_data_dump.sql
```

### Langkah 4: Hapus File Dump Sementara
Demi keamanan credential dan kebersihan direktori, hapus file dump sementara:
* **PowerShell**: `Remove-Item local_data_dump.sql`
* **Bash**: `rm local_data_dump.sql`

---

## 3. Sinkronisasi KV Namespace (Lokal ➡️ Remote) Secara Aman

Cloudflare KV menyimpan data dalam bentuk Key-Value. Sinkronisasi data lokal ke remote dapat dilakukan secara aman menggunakan bulk JSON upload:

### Langkah 1: Siapkan File JSON Bulk Data
Buat sebuah file baru bernama `kv_bulk_data.json` dengan format array objek JSON:
```json
[
  {
    "key": "site:email",
    "value": "helmiari@example.com"
  },
  {
    "key": "site:configuration",
    "value": "{\"maintenance\": false}"
  }
]
```
*(Isi key dan value sesuai dengan data lokal yang ingin Anda migrasikan ke remote)*.

### Langkah 2: Kirim Bulk Data ke KV Remote
Jalankan perintah bulk put menggunakan ID Namespace KV remote Anda (bisa ditemukan di file `wrangler.toml` bagian `id` di bawah `[[kv_namespaces]]`):
```bash
bunx wrangler kv:bulk put --namespace-id <ID_NAMESPACE_REMOTE_KV> kv_bulk_data.json --remote
```
> [!NOTE]  
> Perintah bulk put ini **hanya akan menambahkan atau memperbarui** pasangan key-value yang terdaftar di file JSON Anda. Key lama yang sudah ada di remote dan tidak disebutkan dalam file JSON **tidak akan dihapus atau terpengaruh**.

---

## 4. Sinkronisasi Storage R2 Bucket (Lokal ➡️ Remote) Secara Aman

File-file aset (seperti file gambar render dan file `.glb` 3D) yang diunggah ke folder lokal disimpan di bawah direktori `.wrangler/state/v3/r2` dalam format hash. Karena format penyimpanannya diacak secara lokal oleh emulator, cara menyinkronkan data secara aman adalah menggunakan file asli di folder proyek Anda:

### Metode A: Menggunakan Cloudflare Dashboard UI (Paling Direkomendasikan & Termudah)
1. Buka browser dan masuk ke **Cloudflare Dashboard**.
2. Arahkan ke menu **R2** > klik nama bucket Anda (misal `dev-web-porto-r2`).
3. Anda dapat langsung mengunggah struktur folder lokal Anda (seperti folder `assets/3Dgallery/`) dengan menyeret (*drag and drop*) folder/file tersebut langsung ke area upload dashboard.
4. Cloudflare secara otomatis mendeteksi file baru. Jika file dengan nama yang sama sudah ada di bucket remote, browser biasanya akan mengonfirmasi atau melewatinya secara aman tanpa menghapus file remote lainnya.

### Metode B: Menggunakan AWS CLI / Rclone (Untuk Skala Besar)
Karena R2 kompatibel dengan protokol S3, Anda dapat menggunakan alat sync standar AWS CLI.
1. Dapatkan **R2 API Credentials** (Access Key ID dan Secret Access Key) dari Cloudflare Dashboard Anda.
2. Konfigurasikan profil AWS CLI (misal bernama `r2`):
   ```bash
   aws configure --profile r2
   ```
3. Sinkronkan folder lokal Anda ke bucket R2 menggunakan perintah `sync` (tanpa menyertakan flag `--delete`):
   ```bash
   aws s3 sync ./src/assets/3Dgallery/ s3://dev-web-porto-r2/assets/3Dgallery/ --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com --profile r2
   ```
   > [!IMPORTANT]  
   > Selama Anda **tidak menambahkan flag `--delete`**, perintah `aws s3 sync` hanya akan mendeteksi file lokal baru/berubah untuk diunggah, dan **tidak akan pernah menghapus** file yang sudah ada di remote bucket R2.
