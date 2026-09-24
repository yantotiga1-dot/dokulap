# DokuLap v1.2 — Fix listActivities

Perbaikan:
- API pembacaan Google Sheet sekarang memakai `getDisplayValues()` agar semua nilai yang dikirim ke browser aman untuk JSON.
- `listActivities` memberi error yang lebih spesifik jika sheet KEGIATAN tidak ditemukan.
- Ditambahkan log jumlah kegiatan yang dikembalikan.
- Logging CREATE_ACTIVITY dan COMPLETE_ACTIVITY menggunakan `user.username`, bukan `user.email`.
- URL Web App tetap sama.

PENTING:
Setelah mengganti Code.gs, Apps Script harus di-deploy sebagai versi baru:
Deploy → Manage deployments → Edit → New version → Deploy.
URL /exec tetap dipertahankan.
