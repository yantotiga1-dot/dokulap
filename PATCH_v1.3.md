# DokuLap v1.3 — Fix response Web App + safer activity flow

Perbaikan utama:
1. `doPost()` sekarang selalu mengembalikan `ContentService.TextOutput` untuk semua action.
2. Sebelumnya protected actions (`listActivities`, `createActivity`, dll.) mengembalikan object JavaScript langsung. Web App Apps Script mensyaratkan doPost/doGet mengembalikan TextOutput atau HtmlOutput.
3. Setelah `createActivity` berhasil, frontend tidak lagi memanggil `listActivities` hanya untuk menampilkan kegiatan yang baru dibuat; respons create langsung dipakai untuk menampilkan Kegiatan Aktif.
4. Saat membuka halaman Kegiatan, kegagalan list tidak menghapus konteks kegiatan aktif yang tersimpan lokal.

PENTING:
- Update `Code.gs` ke versi ini.
- Deploy > Manage deployments > Edit > New version > Deploy.
- Tetap gunakan URL `/exec` yang sama.
- Setelah update frontend, Ctrl+F5.
