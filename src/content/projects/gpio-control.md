---
title: "Otomatisasi GPIO STB B860H: Kontrol Kipas, Indikator Internet, dan Akses Point"
description: "Skrip Bash otomatisasi pin GPIO pada STB B860H untuk manajemen suhu (kipas), indikator status koneksi internet, dan manajemen daya switch On/Off Akses Point."
pubDate: 2026-05-30
tags: ["Bash Script", "GPIO", "STB B860H", "Automation", "Embedded Linux"]
featured: true
image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
github: "https://github.com/username/stb-b860h-gpio-automation"
---

# Otomatisasi Perangkat Pintar Berbasis GPIO pada STB B860H

STB B860H seringkali dialihfungsikan menjadi server rumahan ringan atau router (OpenWrt/Armbian). Namun, penggunaan intensif 24/7 tanpa manajemen suhu dan indikator status yang jelas dapat memperpendek umur perangkat.

Proyek ini menyediakan solusi otomatisasi berbasis **Bash Script** yang memanfaatkan pin GPIO (General Purpose Input/Output) internal STB B860H untuk mengendalikan tiga fitur utama: **Kipas Pendingin (berdasarkan suhu CPU)**, **LED Indikator Koneksi Internet**, dan **Tombol Fisik On/Off Akses Point (Wi-Fi)**.

---

## 🗺️ Pemetaan Pin GPIO STB B860H

Sebelum mengeksekusi skrip, kita perlu menentukan nomor pin sysfs GPIO yang tepat pada SoC Amlogic S905X (B860H v1/v2). 

> **Catatan:** Nomor pin di bawah ini adalah representasi standar pada kernel Linux Armbian/OpenWrt. Sesuaikan nomor pin dengan hasil *mapping* fisik pada board Anda.

| Fitur | Komponen Hardware | Nomor GPIO (sysfs) | Mode |
| :--- | :--- | :--- | :--- |
| **Kontrol Kipas** | Transistor NPN / Relay + Kipas 5V | `GPIO 467` | OUTPUT |
| **Indikator Internet** | LED Merah/Hijau + Resistor | `GPIO 468` | OUTPUT |
| **Switch AP** | Tombol Push Button / Sakelar | `GPIO 469` | INPUT |

---

## 🛠️ Logika Kerja Sistem

1. **Smart Fan Controlling:** Skrip membaca suhu CPU dari `/sys/class/thermal/thermal_zone0/temp`. Jika suhu melebihi 60°C, kipas menyala. Jika suhu turun di bawah 50°C, kipas mati.
2. **Internet Ping Checker:** Skrip melakukan *ping* berkala ke DNS Google (`8.8.8.8`). Jika terhubung, LED menyala konstan (atau mati, tergantung konfigurasi). Jika putus, LED berkedip (*blinking*) sebagai peringatan.
3. **AP Toggle Switch:** Skrip mendeteksi *state* tombol fisik. Jika tombol ditekan, status interface Wi-Fi (`hostapd` atau `wlan0`) akan di-toggle (ON ke OFF, atau sebaliknya).

---

## 📄 Implementasi Skrip Bash (`stb-automation.sh`)

Berikut adalah skrip utama yang berjalan di latar belakang (*background service*) secara terus-menerus:

```bash
#!/bin/bash

# ==========================================
# KONFIGURASI PIN GPIO & PARAMETER
# ==========================================
GPIO_FAN=467
GPIO_LED=468
GPIO_BTN=469

TEMP_THRESHOLD_HIGH=60
TEMP_THRESHOLD_LOW=50
PING_TARGET="8.8.8.8"

# Inisialisasi GPIO
export_gpio() {
    local pin=$1
    local dir=$2
    if [ ! -d "/sys/class/gpio/gpio$pin" ]; then
        echo "$pin" > /sys/class/gpio/export
        echo "$dir" > /sys/class/gpio/gpio$pin/direction
    fi
}

export_gpio $GPIO_FAN "out"
export_gpio $GPIO_LED "out"
export_gpio $GPIO_BTN "in"

# ==========================================
# FUNGSI UTAMA
# ==========================================

control_fan() {
    # Membaca suhu (milliCelsius, contoh: 55000 = 55C)
    local cpu_temp_raw=$(cat /sys/class/thermal/thermal_zone0/temp)
    local cpu_temp=$((cpu_temp_raw / 1000))

    if [ "$cpu_temp" -ge "$TEMP_THRESHOLD_HIGH" ]; then
        echo 1 > /sys/class/gpio/gpio$GPIO_FAN/value # Kipas ON
    elif [ "$cpu_temp" -le "$TEMP_THRESHOLD_LOW" ]; then
        echo 0 > /sys/class/gpio/gpio$GPIO_FAN/value # Kipas OFF
    fi
}

check_internet() {
    if ping -c 1 -W 2 $PING_TARGET > /dev/null 2>&1; then
        echo 1 > /sys/class/gpio/gpio$GPIO_LED/value # Internet OK -> LED ON
    else
        # Internet mati -> LED Berkedip
        echo 1 > /sys/class/gpio/gpio$GPIO_LED/value
        sleep 0.5
        echo 0 > /sys/class/gpio/gpio$GPIO_LED/value
    fi
}

control_ap() {
    local btn_state=$(cat /sys/class/gpio/gpio$GPIO_BTN/value)
    
    # Deteksi tombol ditekan (Active Low / Tersambung ke GND)
    if [ "$btn_state" -eq 0 ]; then
        # Cek status hostapd (Akses Point)
        if systemctl is-active --quiet hostapd; then
            systemctl stop hostapd
            echo "Access Point Terbuka -> Dinonaktifkan"
        else
            systemctl start hostapd
            echo "Access Point Tertutup -> Diaktifkan"
        fi
        # Anti-debounce: tunggu tombol dilepas
        while [ $(cat /sys/class/gpio/gpio$GPIO_BTN/value) -eq 0 ]; do sleep 0.1; done
    fi
}

# ==========================================
# LOOP UTAMA (INFINITE LOOP)
# ==========================================
echo "STB B860H Automation Service Started..."

while true; do
    control_fan
    check_internet
    control_ap
    sleep 2 # Interval pengecekan setiap 2 detik
done