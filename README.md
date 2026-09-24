# DokuLap — Dokumentasi Lapangan
## Frontend v2 — polished prototype

Prototype frontend siap dikembangkan ke backend Google Apps Script.

### Yang ditambahkan pada v2
- Polished sidebar/topbar
- Responsive mobile bottom navigation
- Light/dark theme toggle
- Upload modal
- Drag & drop
- Multi-file upload UI
- Mobile camera capture
- Upload progress simulation
- Photo/video preview modal
- Reusable `DokuComponents`
- Improved micro-interactions, hover, transitions, skeleton-ready styling
- Dashboard, kegiatan, dokumentasi, analisis, laporan

### Catatan
Upload masih simulasi. Belum mengirim file ke Google Drive.
Data masih mock data. Tahap berikutnya adalah integrasi Google Apps Script + Sheets + Drive.


## Backend v1
Folder `backend/` berisi Google Apps Script API. Lihat `backend/README.md` untuk setup Spreadsheet, Drive, deployment Web App, password, dan konfigurasi URL API.

Upload pada halaman Kegiatan sekarang memakai `assets/js/api.js` dan akan mengirim file nyata ke backend. Batas default Backend v1: 8 MB/file.


### Login
DokuLap Backend v1 menggunakan **username + password**, bukan email. Akun awal: `admin` / `DokuLap@12345`.
