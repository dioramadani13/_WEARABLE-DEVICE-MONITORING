# Product Requirement Document (PRD)
## Website Sistem IoT Monitoring Wearable Hewan (STM32WL & LoRa)

**Judul Skripsi Terkait:** Rancang Bangun dan Evaluasi Sistem Power Management pada Wearable Monitoring Suhu dan Accelerometer untuk Hewan Menggunakan Low Power Microcontroller  
**Versi Dokumen:** 1.0.0  
**Tanggal:** 28 Oktober 2026  
**Status:** Approved  

---

## 1. Executive Summary & Project Objectives

### 1.1 Ringkasan Eksekutif
Dokumen ini mendefinisikan persyaratan produk (PRD) untuk Website Sistem IoT Monitoring Wearable Hewan. Sistem ini dirancang untuk mendukung pengumpulan data, visualisasi *real-time*, evaluasi strategi efisiensi daya (*power management*), serta kontrol jarak jauh terhadap *node* sensor *wearable* berbasis mikrokontroler *low-power* STM32WL. 

*Node wearable* dipasangkan pada hewan untuk mengukur suhu tubuh dan gerakan 3-axis (*accelerometer*), kemudian mengirimkan data menggunakan protokol komunikasi RF LoRa (Sub-GHz). Fokus mendasar dari platform web ini tidak hanya terbatas pada pemantauan fisiologis dan perilaku hewan, melainkan juga berfungsi sebagai instrumen pengujian dan evaluasi komparatif performa baterai, konsumsi arus, serta keandalan transmisi data pada berbagai mode hemat daya mikrokontroler.

### 1.2 Tujuan Proyek (Project Objectives)
- **Monitoring Real-Time Fisiologis & Perilaku:** Menyediakan visualisasi telemetri suhu tubuh dan akselerasi 3-sumbu ($X, Y, Z$) secara *real-time* dengan *latency* $< 1.0 \text{ s}$ dari Message Broker ke Dashboard Web.
- **Telemetri & Evaluasi Power Management:** Menampilkan estimasi sisa daya baterai ($\%$), konsumsi arus ($\text{mA} / \mu\text{A}$), tegangan baterai ($\text{V}$), serta status mode daya mikrokontroler (*Active*, *Sampling*, *Sleep*).
- **Remote Power Management Downlink:** Memungkinkan peneliti/pengguna mengonfigurasi interval *sampling* sensor, interval pengiriman data LoRa, dan *switch* profil mode daya secara *remote* melalui pesan *downlink* LoRa.
- **Modul Analytics Skripsi:** Menyediakan instrumen analisis statistik perbandingan konsumsi daya sebelum vs sesudah optimasi, perhitungan galat suhu ($\text{MAE}$ dan $\text{RMSE}$) terhadap alat ukur referensi, serta pencatatan kontinuitas data (*data loss / continuity rate*).
- **Alerting & Manajemen Aset:** Memberikan peringatan dini (*alert*) terkait suhu abnormal, kelumpuhan/inaktivitas hewan, kondisi *low battery*, dan penurunan kualitas sinyal LoRa ($\text{RSSI} / \text{SNR}$).

---

## 2. User Personas & Main Use Cases

### 2.1 User Personas

| Persona | Peran & Latar Belakang | Kebutuhan Utama (*Needs*) | Tantangan (*Pain Points*) |
| :--- | :--- | :--- | :--- |
| **Peneliti / Academic Researcher (Primary)** | Mahasiswa/Dosen yang melakukan riset skripsi efisiensi daya mikrokontroler STM32WL. | Grafik komparatif daya, modul validasi galat ($\text{MAE}/\text{RMSE}$), ekspor data historis CSV/Excel, serta log kontinuitas data. | Sulit memverifikasi apakah *sleep mode* STM32WL benar-benar menghemat baterai tanpa alat ukur terintegrasi di web. |
| **Pemilik Hewan / Farm Owner** | Pemilik peternakan atau hewan peliharaan yang dipasang *node wearable*. | Dashboard ringkas indikator kesehatan hewan (Suhu Normal/Demam) dan status aktivitas (Diam/Jalan/Lari). | Tidak memiliki latar belakang teknis IoT, butuh visualisasi yang mudah dipahami (*color-coded alert*). |
| **Field Technician / Handler** | Petugas lapangan yang memasang dan merawat perangkat *wearable* pada hewan. | Indikator kualitas sinyal ($\text{RSSI}$ & $\text{SNR}$), level baterai fisik, serta fitur perbaikan interval *sampling* secara cepat. | Kesulitan mengambil perangkat dari hewan jika harus dikonfigurasi ulang via kabel serial (butuh OTA *Downlink*). |

### 2.2 Main Use Cases
1. **UC-01: Pemantauan Real-Time & Status Kesehatan Hewan:** Peneliti/Owner membuka *dashboard* untuk melihat suhu *real-time*, aktivitas 3-axis, dan estimasi baterai.
2. **UC-02: Remote Power Management Downlink:** Peneliti mengubah interval pengiriman data dari $10 \text{ s}$ ke $60 \text{ s}$ melalui panel web untuk menguji penghematan energi pada STM32WL.
3. **UC-03: Evaluasi Galat & Performa Daya (Analytics Skripsi):** Peneliti mengunggah data pembacaan alat referensi (termometer standar) untuk memvalidasi akurasi sensor dan membandingkan kurva konsumsi daya sebelum vs sesudah optimasi.
4. **UC-04: Handling Notifikasi & Threshold Alert:** Sistem mengirim notifikasi instan saat suhu hewan $> 39.5^\circ\text{C}$ atau saat baterai *wearable* di bawah $15\%$.

---

## 3. Functional Requirements (FR)

### 3.1 Modul 1: Dashboard Monitoring Real-Time & Telemetri Daya

| Requirement ID | Feature Name | Description | Priority | User Story |
| :--- | :--- | :--- | :--- | :--- |
| **FR-MON-01** | Visualisasi Suhu Real-Time | Menampilkan nilai suhu tubuh terkini dengan status indikator warna (Hijau: Normal, Kuning: Waspada, Merah: Demam/Hipotermia). | Must Have | Sebagai owner, saya ingin melihat suhu tubuh hewan secara live agar mengetahui kondisi fisiknya secara efisien. |
| **FR-MON-02** | Grafik Accelerometer 3-Axis & Klasifikasi Aktivitas | Plot *streaming* garis 3-axis ($X, Y, Z$) dan label klasifikasi aktivitas hewan (Diam, Berjalan, Berlari). | Must Have | Sebagai peneliti, saya ingin memantau profil akselerasi dan status aktivitas hewan untuk mengorelasikannya dengan konsumsi daya. |
| **FR-MON-03** | Telemetri Daya & Masa Pakai Baterai | Menampilkan persentase baterai ($\%$), tegangan ($\text{V}$), konsumsi arus kalkulatif ($\text{mA}/\mu\text{A}$), serta estimasi sisa waktu operasi (hari/jam). | Must Have | Sebagai peneliti skripsi, saya ingin melihat metrik daya lengkap untuk mengevaluasi efisiensi baterai pada node wearable. |
| **FR-MON-04** | Status Mode Operasi Mikrokontroler | Menampilkan status *runtime* STM32WL (*Active Mode*, *Sampling Mode*, *Low-Power/Sleep Mode*) secara dinamis. | Must Have | Sebagai peneliti, saya ingin melihat state mode mikrokontroler yang aktif untuk mengonfirmasi fungsi manajemen daya. |

### 3.2 Modul 2: Panel Kontrol Remot (Power Management Downlink)

| Requirement ID | Feature Name | Description | Priority | User Story |
| :--- | :--- | :--- | :--- | :--- |
| **FR-CTL-01** | Pengaturan Interval Sampling Sensor | Formulir untuk mengubah interval pengambilan sampel sensor ($1 \text{ s}$ hingga $300 \text{ s}$) via pesan Downlink LoRa. | Must Have | Sebagai peneliti, saya ingin mengubah frekuensi sampling secara nirkabel untuk menguji pengaruhnya terhadap baterai. |
| **FR-CTL-02** | Pengaturan Interval Transmisi LoRa | Pengaturan frekuensi *uplink* data LoRa (TX Interval) terpisah dari interval *sampling* internal sensor. | Must Have | Sebagai peneliti, saya ingin menerapkan strategi data batching sebelum pengiriman agar dapat menekan waktu transmisi RF. |
| **FR-CTL-03** | Profil Mode Hemat Daya Switch | Toggle/Dropdown pilihan mode hemat daya mikrokontroler (*Run Mode*, *Sleep Mode*, *Stop Mode*, *Standby Mode*). | Must Have | Sebagai peneliti, saya ingin memilih profil power mode STM32WL secara cepat dari web dashboard. |

### 3.3 Modul 3: Modul Analytics & Evaluasi Penelitian

| Requirement ID | Feature Name | Description | Priority | User Story |
| :--- | :--- | :--- | :--- | :--- |
| **FR-ANA-01** | Grafik Komparatif Konsumsi Daya (Before vs After) | Visualisasi grafik *overlay* komparatif rata-rata konsumsi arus dan estimasi umur baterai Sebelum vs Sesudah Optimasi. | Must Have | Sebagai peneliti skripsi, saya membutuhkan perbandingan kurva daya langsung di web untuk menyajikan bukti efisiensi skema low-power. |
| **FR-ANA-02** | Validasi Galat Pembacaan Suhu | Input data manual/CSV alat ukur referensi (misal termometer medis), kalkulasi otomatis $\text{MAE}$ & $\text{RMSE}$. | Should Have | Sebagai peneliti, saya ingin sistem menghitung galat sensor suhu secara otomatis agar proses pengujian alat lebih akurat. |
| **FR-ANA-03** | Log Kontinuitas Data (Data Loss Analysis) | Analisis persen *packet loss* dan gap waktu antar data saat mode *low-power* aktif. | Should Have | Sebagai peneliti, saya ingin mengetahui keandalan pengiriman data LoRa pada skema daya rendah. |
| **FR-ANA-04** | Ekspor Data Historis CSV/Excel | Fitur filter rentang waktu dan ekspor seluruh log sensor & telemetri daya ke file CSV atau XLSX. | Must Have | Sebagai peneliti, saya ingin mengunduh mentahan data telemetri untuk diolah lebih lanjut pada software statistik skripsi (MATLAB/Python). |

### 3.4 Modul 4: Modul Notifikasi & Peringatan

| Requirement ID | Feature Name | Description | Priority | User Story |
| :--- | :--- | :--- | :--- | :--- |
| **FR-ALT-01** | Alert Suhu & Inaktivitas Hewan | Peringatan pop-up web dan email/Telegram jika suhu $> 39.5^\circ\text{C}$ / $< 36.0^\circ\text{C}$ atau akselerometer menunjukkan diam berlebihan ($> 2 \text{ jam}$). | Must Have | Sebagai handler, saya butuh peringatan cepat jika hewan mengalami demam tinggi atau lemas tidak bergerak. |
| **FR-ALT-02** | Alert Low Battery & Offline Hardware | Notifikasi ketika kapasitas baterai $< 20\%$ atau perangkat tidak mengirimkan paket *uplink* selama lebih dari $3 \times$ interval pengiriman. | Must Have | Sebagai teknisi, saya ingin mendapat alert saat baterai akan habis agar dapat melakukan penggantian baterai tepat waktu. |
| **FR-ALT-03** | Indikator Kualitas Sinyal LoRa ($\text{RSSI}$ & $\text{SNR}$) | Visualisasi nilai $\text{RSSI}$ ($\text{dBm}$) dan $\text{SNR}$ ($\text{dB}$) beserta rating kualitas koneksi (*Excellent*, *Fair*, *Poor*). | Should Have | Sebagai teknisi lapangan, saya ingin memantau kuat sinyal LoRa untuk memastikan lokasi hewan masih tercover gateway. |

### 3.5 Modul 5: Modul Manajemen Aset (Hewan & Wearable)

| Requirement ID | Feature Name | Description | Priority | User Story |
| :--- | :--- | :--- | :--- | :--- |
| **FR-AST-01** | Manajemen Profil Hewan | CRUD data hewan (ID Hewan, Nama/Label, Jenis/Spesies, Usia, Berat Badan, Catatan Medis). | Must Have | Sebagai pemantau, saya ingin mendaftarkan identitas hewan agar data sensor terasosiasi dengan objek penelitian yang jelas. |
| **FR-AST-02** | Manajemen Perangkat Wearable | CRUD data node hardware (Device ID, LoRa DevEUI, AppKey, Versi Firmware STM32WL, Tanggal Kalibrasi, Status Pairing dengan Hewan). | Must Have | Sebagai peneliti, saya ingin mendaftarkan dan memetakan node STM32WL ke hewan target secara terstruktur. |

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Latency
- **MQTT & WebSocket Latency:** Latensi *end-to-end* dari saat data diterima oleh Gateway LoRa hingga dirender di web UI melalui WebSocket harus $< 1.0 \text{ s}$.
- **Downlink Execution Latency:** Perintah *downlink* dari web *dashboard* harus terkirim ke *queue* MQTT broker dalam waktu $< 500 \text{ ms}$ (eksekusi pada node bergantung pada window RX Class A / Class C LoRaWAN).
- **Dashboard Rendering Speed:** Visualisasi grafik *real-time* harus mampu mempertahankan *framerate* $> 30 \text{ FPS}$ tanpa menyebabkan lag browser saat menerima data frekuensi tinggi.
- **Page Load Time:** Waktu muat awal halaman *dashboard* web harus $< 2.0 \text{ s}$ pada koneksi internet standar ($10 \text{ Mbps}$).

### 4.2 Data Storage & Retention
- **Time-Series Database Selection:** Menggunakan **TimescaleDB** atau **InfluxDB** khusus untuk menyimpan data telemetri berstempel waktu (*timestamped sensor data*) demi performa *query* yang optimal.
- **Relational Database Selection:** Menggunakan **PostgreSQL** untuk menyimpan data relasional seperti manajemen pengguna, profil hewan, metadata *node*, dan log notifikasi.
- **Retention Policy:** Data telemetri mentah (*raw data*) disimpan selama 90 hari. Setelah 90 hari, sistem melakukan *downsampling* otomatis (agregasi per jam/per hari) untuk penghematan media penyimpanan.

### 4.3 Reliability, Security, & Power Metric Accuracy
- **System Uptime & Availability:** Backend & Web Server ditargetkan memiliki ketersediaan minimum $99.5\%$.
- **Authentication & Authorization:** Autentikasi menggunakan JSON Web Tokens (JWT) dengan *Role-Based Access Control* (RBAC) yang membedakan hak akses Peneliti, Owner, dan Admin.
- **Data Encryption:** Seluruh komunikasi HTTP dialihkan ke HTTPS (TLS 1.3) dan WebSocket menggunakan Secure WebSocket (WSS). Transmisi LoRa disandi dengan enkripsi AES-128 bit (standar LoRaWAN).
- **Akurasi Kalkulasi Telemetri Daya:** Perhitungan estimasi konsumsi arus dan masa pakai baterai pada *backend* harus memperhitungkan kurva *non-linear discharge* baterai Li-Ion/LiPo serta pembacaan analog (ADC / sensor INA219) dengan margin galat kalkulasi $< 3\%$.

---

## 5. System Architecture & Data Flow Overview

### 5.1 Diagram Arsitektur Sistem 5-Layer

```text
+-----------------------------------------------------------------------------------+
| LAYER 1: HARDWARE EDGE NODE (Wearable Hewan)                                       |
|  [ Sensor Suhu (DS18B20/TMP117) ] + [ Accelerometer 3-Axis (LIS3DH/ADXL345) ]      |
|                                    |                                              |
|            -- (SPI / I2C / OneWire) -->  [ STM32WL Low Power Microcontroller ]    |
|                                          [ (Active / Sampling / Sleep Modes) ]    |
+-----------------------------------------------------------------------------------+
                                     | (LoRa Sub-GHz RF Payload)
                                     v
+-----------------------------------------------------------------------------------+
| LAYER 2: NETWORK & GATEWAY LAYER                                                   |
|  [ LoRaWAN Gateway (Indoor/Outdoor) ] --(UDP Packet Forwarder)--> [ ChirpStack ]  |
+-----------------------------------------------------------------------------------+
                                     | (Decoded JSON Payload)
                                     v
+-----------------------------------------------------------------------------------+
| LAYER 3: MESSAGE BROKER & INGESTION BACKEND                                        |
|  [ Eclipse Mosquitto / EMQX MQTT Broker ]                                          |
|                                    | (Subscribe Uplink / Publish Downlink)        |
|  [ Node.js / Python FastAPI Backend Ingestion Engine ]                            |
+-----------------------------------------------------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+------------------------------------+   +------------------------------------------+
| LAYER 4: DATABASE LAYER            |   | LAYER 5: FRONTEND APPLICATION            |
| - TimescaleDB / InfluxDB           |   | - Next.js / React Web Dashboard          |
|   (Time-Series Sensor Telemetry)   |   | - Recharts / Chart.js Data Plots         |
| - PostgreSQL                       |   | - WebSocket Client (Real-time Push)     |
|   (Metadata, Asset & Downlink Log) |   | - REST API Client (Analytics & Export)   |
+------------------------------------+   +------------------------------------------+
```

### 5.2 Penjelasan Alur Data (Data Flow)

#### 1. Uplink Data Flow (Sensor ke Web Dashboard)
1. Mikrokontroler STM32WL bangun dari *Sleep Mode* pada interval waktu yang ditentukan, membaca data suhu dan *accelerometer* 3-axis.
2. STM32WL mengemas data telemetri daya (tegangan baterai, akumulasi arus) dan data sensor menjadi *payload* biner yang ringkas.
3. Modul RF LoRa terintegrasi pada STM32WL memancarkan *payload* ke LoRa Gateway.
4. Gateway menyalurkan paket ke LoRaWAN Network Server (ChirpStack), yang mendekode *payload* biner menjadi format JSON.
5. ChirpStack mempublikasikan pesan JSON ke MQTT Broker pada topik `application/wearable/node/{DevEUI}/rx`.
6. Backend Server mendengarkan (*subscribe*) topik tersebut, memproses kalkulasi daya, menyimpan data ke TimescaleDB/InfluxDB, dan memancarkan data secara instan via WebSocket ke Frontend Dashboard Web.

#### 2. Downlink Control Flow (Web ke STM32WL)
1. Peneliti mengatur parameter baru (misal: mengubah interval *sampling* dari $10 \text{ s}$ ke $60 \text{ s}$) pada Panel Kontrol Web.
2. Web Frontend mengirimkan permintaan HTTP POST ke Backend API.
3. Backend menyusun *command payload* biner dan mempublikasikannya ke MQTT Broker pada topik `application/wearable/node/{DevEUI}/tx`.
4. ChirpStack/Gateway meneruskan pesan *Downlink* ke node STM32WL saat window penerimaan (RX window) terbuka.
5. STM32WL memperbarui variabel konfigurasi internalnya dan mengirimkan konfirmasi ACK kembali ke web.

---

## 6. High-Level UI/UX & Wireframe Layout Recommendations

### 6.1 Tata Letak (Grid Layout) Dashboard Utama

```text
+---------------------------------------------------------------------------------------------------------+
| [HEADER NAV] Logo | Select Animal / Device Node [ Sapi-01 (EUI: 70B3D5...) v ] | Status: ONLINE | User  |
+---------------------------------------------------------------------------------------------------------+
| [TOP METRIC CARDS]                                                                                      |
| +---------------------+ +---------------------+ +---------------------+ +-------------------------------+ |
| | Suhu Tubuh          | | Status Aktivitas    | | Level Baterai       | | Profil MCU Mode               | |
| | 38.4 °C [NORMAL]    | | BERJALAN            | | 84% (3.92 V)        | | SLEEP MODE (STOP2)            | |
| +---------------------+ +---------------------+ +---------------------+ +-------------------------------+ |
+---------------------------------------------------------------------------------------------------------+
| [MAIN CONTENT AREA - SPLIT SCREEN]                                                                      |
| +---------------------------------------------------+ +-----------------------------------------------+ |
| | GRAFIK 1: TELEMETRI SUHU & ACCELEROMETER (LIVE)   | | PANEL KONTROL POWER MANAGEMENT (DOWNLINK)    | |
| | [ Line Chart: Temp vs Time ]                      | |                                               | |
| | [ Multi-Line Chart: X, Y, Z Axis Accelerometer ]  | | 1. Sampling Interval: [ 30 sec v ]          | |
| |                                                   | | 2. LoRa TX Interval: [ 60 sec v ]          | |
| | Sinyal LoRa: RSSI -85 dBm | SNR 9.5 dB (EXCELLENT)  | | 3. Low-Power Mode: [ Stop2 Mode v ]         | |
| |                                                   | | [ BUTTON: SUBMIT & SEND DOWNLINK COMMAND ]    | |
| +---------------------------------------------------+ +-----------------------------------------------+ |
+---------------------------------------------------------------------------------------------------------+
| [BOTTOM AREA: LOG AUDIT & HISTORICAL EXPORT]                                                            |
| Table: Recent Uplink Logs | Data Loss Rate: 0.2% | [ Button: Export Filtered Data to CSV / XLSX ]        |
+---------------------------------------------------------------------------------------------------------+
```

### 6.2 Tata Letak Modul Analytics & Evaluasi Skripsi
- **Section Perbandingan Kurva Daya:** Menampilkan dua grafik garis berdampingan (*side-by-side*) atau *stacked area chart*: "Konsumsi Arus Sebelum Optimasi (*Constant Active*)" vs "Sesudah Optimasi (*Dynamic Sleep*)". Menyediakan widget indikator total efisiensi daya dalam persentase (misal: *"Penghematan Daya: +68.5%"*).
- **Section Validasi Galat Sensor Suhu:** Modul tabel interaktif tempat peneliti memasukkan nilai acuan termometer fisik per *timestamp*, yang secara otomatis menghasilkan grafik dispersi (*Scatter Plot*) serta menampilkan kotak statistik $\text{MAE}$ & $\text{RMSE}$.

### 6.3 Pedoman System Design & Color Palette
- **Color Palette Status:**
  - **Normal / Active / Success:** Hex `#16A34A` (Green)
  - **Warning / Idle / Sampling:** Hex `#CA8A04` (Yellow/Amber)
  - **Critical / Fever / Danger:** Hex `#DC2626` (Red)
  - **Sleep / Low Power Mode:** Hex `#2563EB` (Blue)
- **Typography & Theme:** Menggunakan font Inter atau Sans-Serif yang bersih, kontras tinggi, serta mendukung fitur *Dark/Light Mode toggle* untuk kenyamanan analisis malam hari.

---

## 7. Acceptance Criteria & Test Plan Metrics

### 7.1 Metrik Pengujian Konsumsi Daya (Power Management Validation)

| Metrik Pengujian | Target Parameter / Formula | Metode Pengujian | Kriteria Lolos (*Pass Criteria*) |
| :--- | :--- | :--- | :--- |
| **Rata-rata Arus Active Mode** | $I_{\text{active}} \le 15 \text{ mA}$ | Pengukuran dengan Multimeter/Power Profiler saat STM32WL memproses data & TX LoRa. | Nilai arus terukur dan tervisualisasi di web $\le$ target *spec sheet*. |
| **Rata-rata Arus Sleep Mode** | $I_{\text{sleep}} \le 20 \mu\text{A}$ (Stop2 Mode) | Pengukuran arus microampere saat STM32WL mematikan peripheral non-esensial. | Arus sleep konsisten $< 20 \mu\text{A}$ dan status mode di web terupdate menjadi 'Sleep'. |
| **Estimasi Masa Pakai Baterai** | $$T_{\text{life}} = \frac{\text{Capacity (mAh)}}{I_{\text{avg}} (\text{mA})}$$ | Simulasi komparasi daya baterai $1000 \text{ mAh}$ pada berbagai interval *downlink transmission*. | Kalkulasi umur baterai web sesuai dengan hasil estimasi teoritis ($\pm 5\%$). |

### 7.2 Metrik Validasi Galat Sensor Suhu (Temperature Accuracy Metrics)

Kalkulasi akurasi sensor suhu dihitung secara otomatis pada Modul Analytics menggunakan dua formulasi standar skripsi:

1. **Mean Absolute Error (MAE):**
   $$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} \left| T_{\text{wearable}, i} - T_{\text{reference}, i} \right|$$

2. **Root Mean Square Error (RMSE):**
   $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} \left( T_{\text{wearable}, i} - T_{\text{reference}, i} \right)^2}$$

| Metrik Galat | Batas Ambang Maksimum (*Threshold*) | Kriteria Lolos (*Pass Criteria*) |
| :--- | :--- | :--- |
| **MAE (Mean Absolute Error)** | $\text{MAE} \le 0.3^\circ\text{C}$ | Rata-rata selisih mutlak pembacaan sensor *wearable* terhadap termometer referensi medis tidak melebihi $0.3^\circ\text{C}$. |
| **RMSE (Root Mean Square Error)** | $\text{RMSE} \le 0.5^\circ\text{C}$ | Akar rata-rata kuadrat galat tidak melebihi $0.5^\circ\text{C}$ untuk memastikan tidak ada deviasi ekstrem. |

### 7.3 Matriks Acceptance Criteria Pengujian Web (Pass/Fail Test Plan)

| Test Case ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-WEB-01** | Real-time Telemetry Ingestion | Kirim paket LoRa *uplink* dari node STM32WL. | Dashboard terbarui otomatis via WebSocket $< 1.0 \text{ s}$ tanpa reload. | PASS |
| **TC-WEB-02** | Downlink Sampling Interval Change | Ubah interval *sampling* ke $60 \text{ s}$ di UI dan klik Submit. | Pesan Downlink MQTT dipublikasikan, node STM32WL mengubah interval ke $60 \text{ s}$. | PASS |
| **TC-WEB-03** | Validasi Galat Suhu Auto-Calculation | Upload file CSV data acuan termometer referensi. | Sistem menampilkan nilai $\text{MAE}$ dan $\text{RMSE}$ secara otomatis pada modul analytics. | PASS |
| **TC-WEB-04** | Export Data Historis | Pilih rentang tanggal 7 hari terakhir dan klik Ekspor CSV. | File CSV terunduh berisi seluruh stempel waktu, suhu, akselerasi $X/Y/Z$, dan data baterai. | PASS |
