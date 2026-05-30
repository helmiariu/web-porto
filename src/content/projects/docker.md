---
title: "clone Efficient Multi-Stage Build for Go ARM64"
description: "Optimasi containerization aplikasi backend Go SSE menggunakan Docker Multi-stage Build untuk memangkas ukuran image hingga 95% agar super ringan saat berjalan di STB HG680P."
pubDate: 2026-05-29
tags: ["Docker", "DevOps", "Golang", "ARM64 Architecture"]
featured: false
image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
github: "https://github.com/helmiariu/go-stb-monitor/blob/main/Dockerfile"
---

# Dockerizing Go Backend for Low-Resource Embedded Server

Setelah berhasil membuat *backend* monitoring berbasis Server-Sent Events (SSE) dengan Go, tantangan berikutnya adalah proses *deployment*. Karena target server adalah STB HG680P dengan arsitektur **ARM64** dan penyimpanan internal yang sangat terbatas (eMMC bawaan hanya 8GB), menggunakan image Docker standar adalah sebuah pemborosan besar.

Proyek ini fokus pada optimasi pengemasan (*containerization*) menggunakan **Docker Multi-stage Build** untuk menciptakan *image* siap produksi yang sekecil dan seefisien mungkin.

---

## ⚡ Tantangan Arsitektur: Mengapa Bukan Standard Build?

Jika kita menggunakan `Dockerfile` standar berbasis `golang:alpine`, ukuran *image* akhir bisa mencapai **300MB - 500MB**. Di dalam server berspesifikasi rendah, ukuran sebesar ini memakan ruang disk yang berharga dan memperlambat proses *startup* kontainer.

Padahal, Go adalah bahasa yang dikompilasi (*compiled language*). Artinya, setelah kode diubah menjadi biner (*binary file*), kita tidak lagi membutuhkan Go SDK, compiler, bahkan *package manager* di dalam lingkungan eksekusi (*runtime*).

---

## 🛠️ Strategi Multi-Stage Build

Dengan menggunakan *Multi-stage Build*, proses Dockerization dibagi menjadi dua tahap terpisah di dalam satu `Dockerfile`:

1. **Stage 1 (Builder):** Menggunakan image Golang lengkap untuk mengunduh dependensi dan mengompilasi kode menjadi biner statis.
2. **Stage 2 (Runtime):** Mengambil hasil biner statis dari Stage 1 dan memasukkannya ke dalam image `alpine` atau `scratch` yang sangat kosong.

---

## 📄 Implementasi Dockerfile

Berikut adalah konfigurasi `Dockerfile` optimal yang digunakan untuk memisahkan tahap kompilasi dan tahap eksekusi:

```dockerfile
# ==========================================
# STAGE 1: Builder (Proses Kompilasi)
# ==========================================
FROM golang:1.24-alpine AS builder

# Install git dan certificates jika diperlukan
RUN apk update && apk add --no-cache git ca-certificates

WORKDIR /app

# Memanfaatkan Docker layer caching untuk dependensi
COPY go.mod ./
RUN go.mod download

COPY . .

# UX FIX: Kompilasi khusus untuk arsitektur ARM64 (STB) dan matikan CGO
# agar menghasilkan biner statis murni yang tidak bergantung pada OS library
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o go-sse-server .

# ==========================================
# STAGE 2: Runtime (Lingkungan Eksekusi)
# ==========================================
FROM alpine:3.19

WORKDIR /root/

# Salin sertifikat SSL dan biner hasil kompilasi dari stage builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/go-sse-server .

# Port yang digunakan oleh server SSE Go
EXPOSE 8080

# Jalankan aplikasi
CMD ["./go-sse-server"]