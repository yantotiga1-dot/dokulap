# DokuLap Complete v1 — Panduan Instalasi

DokuLap Complete v1 berisi:
1. Frontend HTML/CSS/JavaScript
2. Backend Google Apps Script
3. Template struktur Google Sheets
4. Panduan deployment GitHub Pages + Google Apps Script + Google Drive

## A. STRUKTUR PAKET

```text
DokuLap/
├── index.html
├── dashboard.html
├── kegiatan.html
├── dokumentasi.html
├── analisis.html
├── laporan.html
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
├── backend/
│   ├── Code.gs
│   └── README.md
├── sheet-template/
│   ├── KEGIATAN.csv
│   ├── DOKUMENTASI.csv
│   ├── SEKOLAH.csv
│   ├── PENGGUNA.csv
│   ├── LOG_AKTIVITAS.csv
│   └── SETTING.csv
└── PANDUAN_INSTALASI.md
```

---

# B. LANGKAH 1 — SIAPKAN GOOGLE DRIVE

1. Login ke akun Google yang akan dipakai DokuLap.
2. Buka Google Drive.
3. Tidak perlu membuat folder DOKULAP secara manual.
4. Backend akan membuat otomatis folder:

```text
DOKULAP/
└── 2026/
    └── Nama Kegiatan/
        ├── Foto/
        ├── Video/
        ├── Dokumen/
        └── Lainnya/
```

Jangan menghapus folder root DOKULAP setelah sistem digunakan.

---

# C. LANGKAH 2 — BUAT GOOGLE SHEETS

Buat Google Spreadsheet baru, misalnya:

`DokuLap Database`

Ada dua pilihan:

### Pilihan yang disarankan
Biarkan Spreadsheet kosong.

Kemudian backend akan membuat seluruh sheet secara otomatis ketika `setupDokuLap()` dijalankan.

Sheet yang dibuat:

- KEGIATAN
- DOKUMENTASI
- SEKOLAH
- PENGGUNA
- LOG_AKTIVITAS
- SETTING

### Pilihan alternatif
Gunakan file CSV pada folder `sheet-template/` jika ingin melihat struktur tabel terlebih dahulu.

CSV bukan database terpisah. Struktur tersebut hanya template untuk Google Sheets.

---

# D. LANGKAH 3 — PASANG GOOGLE APPS SCRIPT

1. Buka Google Spreadsheet `DokuLap Database`.
2. Pilih:

`Extensions → Apps Script`

3. Hapus kode bawaan.
4. Buka:

`backend/Code.gs`

5. Copy seluruh isinya ke Apps Script.
6. Klik Save.

PENTING:

Jalankan Apps Script dari Spreadsheet DokuLap yang sama agar `SpreadsheetApp.getActiveSpreadsheet()` menemukan database yang benar.

---

# E. LANGKAH 4 — JALANKAN SETUP

Di Apps Script:

1. Pada dropdown function pilih:

`setupDokuLap`

2. Klik Run.
3. Google akan meminta authorization.
4. Izinkan akses Google Drive dan Google Sheets.

Setelah berhasil, spreadsheet akan memiliki:

```text
KEGIATAN
DOKUMENTASI
SEKOLAH
PENGGUNA
LOG_AKTIVITAS
SETTING
```

Dan Google Drive akan memiliki:

```text
DOKULAP
└── 2026
```

---

# F. AKUN LOGIN

Akun awal:

```text
Username: admin
Password: DokuLap@12345
```

Segera ganti password.

Di Apps Script jalankan:

```javascript
setDokuLapPassword("PasswordBaruYangKuat")
```

Contoh:

```javascript
setDokuLapPassword("DokuLap2026!Aman")
```

Untuk mengganti username:

```javascript
setDokuLapUsername("tomi")
```

Setelah itu login menggunakan username baru.

---

# G. LANGKAH 5 — DEPLOY BACKEND SEBAGAI WEB APP

Di Apps Script:

`Deploy → New deployment`

Pilih:

`Web app`

Konfigurasi:

### Execute as
`Me`

### Who has access
`Anyone`

Kemudian klik:

`Deploy`

Google akan memberikan URL seperti:

```text
https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

COPY URL tersebut.

Jangan gunakan URL `/dev`.

Gunakan URL `/exec`.

---

# H. LANGKAH 6 — MASUKKAN URL BACKEND KE FRONTEND

Buka:

```text
assets/js/api.js
```

Cari:

```javascript
const DOKULAP_API_URL = 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Ganti menjadi:

```javascript
const DOKULAP_API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

Simpan.

JANGAN memasukkan:
- Spreadsheet ID
- Drive Folder ID
- Password
- credential Google

ke dalam frontend.

Semua credential dan ID penting tetap berada di backend.

---

# I. LANGKAH 7 — TEST BACKEND

Sebelum GitHub Pages, buka URL `/exec` dari browser.

Jika backend aktif, harus muncul JSON seperti:

```json
{
  "ok": true,
  "app": "DokuLap",
  "version": "1.0.0",
  "message": "DokuLap API aktif. Gunakan POST."
}
```

Jika muncul demikian, Apps Script sudah aktif.

---

# J. LANGKAH 8 — TEST LOGIN

Buka frontend:

```text
index.html
```

Masukkan:

```text
Username: admin
Password: password yang telah ditetapkan
```

Klik:

`MASUK`

Jika berhasil → Dashboard.

---

# K. LANGKAH 9 — TEST KEGIATAN

Masuk:

`Kegiatan`

Isi:

- Nama kegiatan
- Jenis kegiatan
- Sekolah/lokasi
- Tanggal
- Lokasi
- Deskripsi

Klik:

`Simpan & Mulai Kegiatan`

Backend akan:

1. membuat ID kegiatan
2. membuat folder tahun
3. membuat folder kegiatan
4. membuat Foto
5. membuat Video
6. membuat Dokumen
7. membuat Lainnya
8. menyimpan metadata kegiatan ke `KEGIATAN`

---

# L. LANGKAH 10 — TEST UPLOAD

Pada kegiatan aktif:

1. Pilih file.
2. Klik:

`Upload ke Google Drive`

Backend akan:

```text
Frontend
   ↓
API
   ↓
Validasi session
   ↓
Validasi kegiatan
   ↓
Decode file
   ↓
Google Drive
   ↓
DOKUMENTASI Sheet
   ↓
LOG_AKTIVITAS
```

Contoh hasil:

```text
Google Drive
DOKULAP
└── 2026
    └── Monitoring SD 01
        └── Foto
            └── IMG_001.jpg
```

Di Sheet `DOKUMENTASI` akan tercatat:

```text
DOC-XXXX
KGT-XXXX
Foto
IMG_001.jpg
file_id
file_url
image/jpeg
ukuran
timestamp
Berhasil
```

---

# M. LANGKAH 11 — PASANG DI GITHUB PAGES

Buat repository GitHub, misalnya:

`dokulap`

Upload isi folder DokuLap.

Pastikan `index.html` berada di root repository.

Kemudian:

`Settings → Pages`

Pilih:

```text
Deploy from branch
Branch: main
Folder: / (root)
```

Simpan.

GitHub akan memberikan alamat:

```text
https://username.github.io/dokulap/
```

Buka alamat tersebut.

---

# N. ALUR PEMAKAIAN HARIAN

```text
LOGIN
 ↓
DASHBOARD
 ↓
BUAT KEGIATAN
 ↓
SIMPAN & MULAI
 ↓
KEGIATAN AKTIF
 ↓
📷 FOTO
🎥 VIDEO
📄 DOKUMEN
 ↓
GOOGLE DRIVE
 +
GOOGLE SHEETS
 ↓
SELESAIKAN KEGIATAN
 ↓
ANALISIS / LAPORAN
```

---

# O. BATAS BACKEND v1

Backend v1 menggunakan Base64 untuk upload.

Batas aman awal:

`8 MB / file`

Cocok untuk:
- foto
- PDF
- dokumen kecil

Untuk video besar, jangan dipaksakan menggunakan mekanisme v1.

Tahap Backend v2 sebaiknya menggunakan mekanisme upload file besar yang lebih efisien.

---

# P. TROUBLESHOOTING

## Login gagal

Periksa:
- username
- password
- Apps Script sudah deploy
- URL `/exec` benar

## Backend belum tersambung

Periksa:

```javascript
const DOKULAP_API_URL = 'URL /exec';
```

## Upload gagal

Periksa:
- kegiatan sudah aktif
- ukuran file <= 8 MB
- MIME type
- izin Google Drive
- deployment Apps Script

## Data tidak muncul

Periksa spreadsheet:

`KEGIATAN`

dan:

`DOKUMENTASI`

Jika metadata masuk Sheet tetapi frontend tidak berubah, periksa URL API frontend.

---

# Q. URUTAN IMPLEMENTASI YANG DISARANKAN

Jangan langsung mengubah banyak bagian sekaligus.

Urutan testing:

1. Apps Script setup
2. Login
3. Create Activity
4. Folder Drive
5. Upload foto
6. Cek DOKUMENTASI
7. Complete Activity
8. Upload beberapa file
9. Deploy GitHub Pages
10. Baru aktifkan Analisis dan Laporan real-time

---

## STATUS V1

Sudah tersedia:

- Frontend DokuLap
- Login username/password
- Backend Apps Script
- Google Sheets schema
- Google Drive automation
- Create Activity
- Active Activity
- Real upload
- Dokumentasi metadata
- Activity log
- Complete Activity
- Delete document API
- Responsive UI

Belum final untuk produksi:

- upload video besar
- analitik real-time penuh
- Kurva-S real-time
- PDF report generator
- backup/restore
- offline queue
- advanced security/rate limiting
