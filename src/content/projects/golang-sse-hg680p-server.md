---
title: "IoT IoT Edge Monitor: Golang SSE Server on HG680P"
description: "Sistem monitoring performa hardware real-time berbasis Server-Sent Events (SSE) menggunakan Go, yang dideploy pada STB Android TV bekas (HG680P) sebagai Linux server."
pubDate: 2026-05-29
tags: ["Golang", "Server-Sent Events", "Linux Embedded", "Hardware"]
featured: true
image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
github: "https://github.com/helmiariu/go-stb-monitor"
---

# Real-Time Resource Monitoring via Server-Sent Events

Proyek ini lahir dari ide memanfaatkan STB (*Set-Top Box*) bekas **Indihome HG680P (Amlogic S905X)** menjadi sebuah *lightweight home server* yang produktif. Di atas sistem ini, saya membangun *backend* menggunakan Go yang bertugas memantau metrik vital *hardware* dan menyuapkannya secara *real-time* ke web portofolio ini.

---

## 🛠️ Mengapa Golang & Server-Sent Events?

Untuk komputer berspesifikasi rendah seperti STB dengan RAM 2GB, efisiensi adalah harga mati. 

* **Server-Sent Events (SSE):** Berbeda dengan WebSocket yang membutuhkan jabat tangan (*handshake*) dua arah yang berat, SSE berjalan di atas protokol HTTP standar secara *unidirectional* (satu arah dari server ke klien). Ini sangat ideal karena web portofolio hanya perlu menerima data tanpa perlu mengirim balik ke STB.
* **Golang Concurrency:** Dengan memanfaatkan *Goroutines* dan *Channels*, aplikasi backend dapat melakukan *polling* data sistem (`/proc/stat` dan `/sys/class/thermal`) setiap 1 detik dengan penggunaan CPU di bawah 1% dan RAM kurang dari 15MB.

---

## 🏗️ Arsitektur Sistem & Alur Data

1. **OS Level:** STB HG680P dipasang OS Armbian Linux (tanpa GUI) untuk performa maksimal.
2. **Data Gathering:** Skrip Go membaca penggunaan CPU, sisa RAM, internal temperatur, dan *uptime* langsung dari kernel Linux.
3. **Event Stream:** Data dibungkus ke dalam format JSON, kemudian dialirkan melalui *HTTP response header* `text/event-stream`.
4. **Client Ingestion:** Halaman portofolio menangkap aliran data ini menggunakan API bawaan browser `EventSource` secara *native* tanpa pustaka tambahan.

---

## 💻 Cuplikan Kode Utama (Go SSE Handler)

Berikut adalah inti dari implementasi *endpoint* SSE di sisi backend Go untuk menjaga koneksi tetap terbuka (*persistent connection*):

```go
func statusHandler(w http.ResponseWriter, r *http.Request) {
    // Set header wajib untuk protokol SSE
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "*") // Izinkan web porto mengakses

    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            metrics := getSystemMetrics() // Mengambil data CPU & RAM
            jsonData, _ := json.Marshal(metrics)
            
            // Format wajib SSE: diawali dengan "data:" dan diakhiri dua baris baru
            fmt.Fprintf(w, "data: %s\n\n", jsonData)
            w.(http.Flusher).Flush() // Paksa kirim data saat ini juga
        case <-r.Context().Done():
            // Koneksi ditutup oleh browser user
            return
        }
    }
}