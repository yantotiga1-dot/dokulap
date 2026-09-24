# DokuLap Backend v1

Backend Google Apps Script untuk:
- membuat struktur Google Sheets
- membuat folder Google Drive otomatis
- autentikasi satu user
- membuat kegiatan
- upload file nyata ke Google Drive
- mencatat metadata upload ke Google Sheets
- daftar kegiatan/dokumentasi
- menyelesaikan kegiatan
- menghapus file (trash) + menandai metadata

## 1. Buat Spreadsheet

Buat Google Spreadsheet baru, misalnya `DokuLap Database`.

Buka:
Extensions → Apps Script

Salin isi `Code.gs` ke project Apps Script tersebut.

## 2. Jalankan setup

Di Apps Script:
1. Pilih function `setupDokuLap`
2. Run
3. Berikan izin Google
4. Setelah selesai, spreadsheet akan berisi:
   - KEGIATAN
   - DOKUMENTASI
   - SEKOLAH
   - PENGGUNA
   - LOG_AKTIVITAS
   - SETTING

Google Drive akan memiliki:
DOKULAP/
  YYYY/
    Kegiatan/
      Foto/
      Video/
      Dokumen/
      Lainnya/

Password awal:
`DokuLap@12345`

WAJIB ganti dengan menjalankan:
`setDokuLapPassword("password-baru-minimal-10-karakter")`

Username bisa diganti dengan:
`setDokuLapUsername("namauser")`

## 3. Deploy Web App

Deploy → New deployment → Web app

Gunakan:
- Execute as: Me
- Who has access: Anyone

Salin URL `/exec`.

Masukkan ke:
`assets/js/api.js`
pada `DOKULAP_API_URL`.

## 4. Upload

Frontend mengubah file menjadi Base64 lalu mengirim:
action=uploadFile
kegiatan_id
nama_file
mime_type
base64
keterangan

Backend:
1. validasi token
2. validasi kegiatan
3. decode file
4. membuat file di Drive
5. menulis metadata ke DOKUMENTASI
6. menulis log

### Batas v1
Default 8 MB/file. Ini sengaja konservatif karena upload Base64 melalui Apps Script. Untuk video besar/produksi, tahap berikutnya sebaiknya memakai arsitektur upload yang tidak mengirim seluruh video sebagai Base64.

## 5. Konfigurasi frontend

Contoh:
```js
const DOKULAP_API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

Jangan menaruh credential Google/Drive/Spreadsheet di frontend.
Frontend hanya menyimpan session token setelah login.

## 6. Keamanan

- Spreadsheet ID dan Drive folder ID hanya di Script Properties.
- Password disimpan sebagai SHA-256 hash.
- Token sesi sementara di CacheService.
- Backend memvalidasi setiap action.
- Nama file disanitasi.
- Upload dibatasi ukuran.
- File tidak dibuat public secara otomatis.

## 7. Catatan CORS

Google Apps Script Web App memiliki batasan CORS yang perlu diuji pada deployment dan browser target. Jika browser memblokir fetch lintas origin pada deployment tertentu, opsi produksi adalah menempatkan proxy/API layer di domain yang sama atau menyajikan frontend melalui Apps Script/Cloud Run. Jangan menonaktifkan keamanan browser.


## Login v1
Akun awal:
- Username: `admin`
- Password: `DokuLap@12345`

Ganti password dengan `setDokuLapPassword("password-baru")` dan username dengan `setDokuLapUsername("username-baru")`.
