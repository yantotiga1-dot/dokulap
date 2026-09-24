/**
 * DokuLap Backend v1
 * Google Apps Script Web App API
 *
 * Deploy as:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * IMPORTANT:
 * - Run setupDokuLap() once from the Apps Script editor.
 * - Set the generated WEB_APP_URL in frontend API_CONFIG.
 * - Change the default password immediately.
 */

const DL = {
  APP: 'DokuLap',
  VERSION: '1.0.0',
  ROOT_FOLDER: 'DOKULAP',
  MAX_FILE_BYTES: 8 * 1024 * 1024, // v1 safe default for Base64 uploads
  TOKEN_TTL_SECONDS: 21600,
  SHEETS: {
    KEGIATAN: 'KEGIATAN',
    DOKUMENTASI: 'DOKUMENTASI',
    SEKOLAH: 'SEKOLAH',
    PENGGUNA: 'PENGGUNA',
    LOG: 'LOG_AKTIVITAS',
    SETTING: 'SETTING'
  }
};

function doGet(e) {
  return json_({ ok: true, app: DL.APP, version: DL.VERSION, message: 'DokuLap API aktif. Gunakan POST.' });
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const action = String(body.action || '').trim();
    let result;

    if (action === 'login') result = login_(body);
    else if (action === 'bootstrap') result = protectedAction_(body, bootstrap_);
    else if (action === 'createActivity') result = protectedAction_(body, createActivity_);
    else if (action === 'completeActivity') result = protectedAction_(body, completeActivity_);
    else if (action === 'listActivities') result = protectedAction_(body, listActivities_);
    else if (action === 'listDocuments') result = protectedAction_(body, listDocuments_);
    else if (action === 'uploadFile') result = protectedAction_(body, uploadFile_);
    else if (action === 'deleteDocument') result = protectedAction_(body, deleteDocument_);
    else if (action === 'health') result = { ok: true, app: DL.APP, version: DL.VERSION };
    else result = { ok: false, error: 'UNKNOWN_ACTION', message: 'Action tidak dikenali.' };

    // A web-app doPost must return TextOutput/HtmlOutput.
    // Protected action handlers return plain objects, so serialize them here.
    if (result && typeof result.getContent === 'function') return result;
    return json_(result);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, error: 'SERVER_ERROR', message: String(err.message || err) });
  }
}

function protectedAction_(body, fn) {
  const user = requireAuth_(body.token);
  return fn(body, user);
}

/* ---------------- AUTH ---------------- */

function login_(body) {
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const props = PropertiesService.getScriptProperties();
  const allowedUsername = String(props.getProperty('USERNAME') || '').trim();
  const passwordHash = props.getProperty('PASSWORD_SHA256');

  if (!allowedUsername || !passwordHash) {
    return json_({ ok: false, error: 'NOT_CONFIGURED', message: 'Autentikasi belum dikonfigurasi. Jalankan setupDokuLap().' });
  }

  if (username !== allowedUsername || sha256_(password) !== passwordHash) {
    log_('LOGIN_GAGAL', '', '', 'Percobaan login: ' + username);
    return json_({ ok: false, error: 'INVALID_LOGIN', message: 'Email atau password salah.' });
  }

  const token = Utilities.getUuid() + '.' + Utilities.getUuid();
  CacheService.getScriptCache().put('TOKEN_' + token, JSON.stringify({
    username: allowedUsername,
    createdAt: new Date().toISOString()
  }), DL.TOKEN_TTL_SECONDS);

  log_('LOGIN', '', '', 'Login berhasil: ' + allowedUsername);
  return json_({
    ok: true,
    token: token,
    expiresIn: DL.TOKEN_TTL_SECONDS,
    user: { username: allowedUsername }
  });
}

function requireAuth_(token) {
  token = String(token || '').trim();
  if (!token) throw new Error('UNAUTHORIZED');

  const raw = CacheService.getScriptCache().get('TOKEN_' + token);
  if (!raw) throw new Error('SESSION_EXPIRED');

  return JSON.parse(raw);
}

/* ---------------- SETUP ---------------- */

function setupDokuLap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Buka Apps Script dari Google Spreadsheet DokuLap.');

  const root = getOrCreateFolder_(DL.ROOT_FOLDER);
  const year = String(new Date().getFullYear());
  const yearFolder = getOrCreateFolder_(year, root);

  const sheetDefs = {
    KEGIATAN: [
      'kegiatan_id','nama_kegiatan','jenis_kegiatan','tanggal_mulai','tanggal_selesai',
      'sekolah_id','lokasi','deskripsi','status','drive_folder_id','created_at','updated_at'
    ],
    DOKUMENTASI: [
      'dokumentasi_id','kegiatan_id','jenis_file','nama_file','file_id','file_url',
      'thumbnail_url','mime_type','ukuran','keterangan','timestamp','status'
    ],
    SEKOLAH: ['sekolah_id','nama_sekolah','kecamatan','alamat','latitude','longitude','catatan'],
    PENGGUNA: ['user_id','nama','username','status','created_at'],
    LOG_AKTIVITAS: ['log_id','timestamp','aktivitas','kegiatan_id','dokumentasi_id','keterangan'],
    SETTING: ['key','value']
  };

  Object.keys(sheetDefs).forEach(name => ensureSheet_(ss, name, sheetDefs[name]));

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('USERNAME')) props.setProperty('USERNAME', 'admin');
  if (!props.getProperty('PASSWORD_SHA256')) props.setProperty('PASSWORD_SHA256', sha256_('DokuLap@12345'));
  props.setProperty('ROOT_FOLDER_ID', root.getId());
  props.setProperty('CURRENT_YEAR_FOLDER_ID', yearFolder.getId());
  props.setProperty('SPREADSHEET_ID', ss.getId());
  props.setProperty('APP_VERSION', DL.VERSION);

  const setting = ss.getSheetByName(DL.SHEETS.SETTING);
  upsertSetting_(setting, 'APP_NAME', DL.APP);
  upsertSetting_(setting, 'ROOT_FOLDER_ID', root.getId());
  upsertSetting_(setting, 'CURRENT_YEAR', year);
  upsertSetting_(setting, 'VERSION', DL.VERSION);

  const pengguna = ss.getSheetByName(DL.SHEETS.PENGGUNA);
  const values = pengguna.getDataRange().getValues();
  const username = props.getProperty('USERNAME');
  if (!values.slice(1).some(r => String(r[2]).toLowerCase() === username.toLowerCase())) {
    pengguna.appendRow(['USR-001', 'Pemilik DokuLap', username, 'Aktif', new Date()]);
  }

  return 'Setup DokuLap selesai. Username=admin. Password awal=DokuLap@12345 (WAJIB diganti).';
}

function setDokuLapPassword(newPassword) {
  if (!newPassword || String(newPassword).length < 10) throw new Error('Password minimal 10 karakter.');
  PropertiesService.getScriptProperties().setProperty('PASSWORD_SHA256', sha256_(String(newPassword)));
  return 'Password DokuLap berhasil diubah.';
}

function setDokuLapUsername(username) {
  username = String(username || '').trim();
  if (!/^[A-Za-z0-9_.-]{3,40}$/.test(username)) throw new Error('Username 3-40 karakter: huruf, angka, titik, garis bawah, atau tanda minus.');
  PropertiesService.getScriptProperties().setProperty('USERNAME', username);
  return 'Username DokuLap berhasil diubah.';
}

/* ---------------- ACTIVITY ---------------- */

function createActivity_(body, user) {
  const ss = getSS_();
  const sh = ss.getSheetByName(DL.SHEETS.KEGIATAN);
  const id = 'KGT-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  const now = new Date();
  const start = body.tanggal_mulai || Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const schoolId = String(body.sekolah_id || '');
  const schoolName = String(body.sekolah_nama || 'Lokasi Umum');

  const yearFolder = getYearFolder_(String(start).slice(0,4));
  const folderName = sanitizeName_(String(start) + '_' + (body.nama_kegiatan || 'Kegiatan'));
  const activityFolder = getOrCreateFolder_(folderName, yearFolder);
  ['Foto','Video','Dokumen','Lainnya'].forEach(n => getOrCreateFolder_(n, activityFolder));

  sh.appendRow([
    id, body.nama_kegiatan || '', body.jenis_kegiatan || 'Lainnya', start,
    body.tanggal_selesai || '', schoolId, body.lokasi || schoolName,
    body.deskripsi || '', 'Aktif', activityFolder.getId(), now, now
  ]);
  log_('CREATE_ACTIVITY', id, '', user.username);

  return { ok: true, activity: activityById_(id) };
}

function completeActivity_(body, user) {
  const id = String(body.kegiatan_id || '');
  const row = findRowById_(DL.SHEETS.KEGIATAN, id);
  if (!row) throw new Error('KEGIATAN_NOT_FOUND');
  const sh = getSS_().getSheetByName(DL.SHEETS.KEGIATAN);
  sh.getRange(row, 9).setValue('Selesai');
  sh.getRange(row, 12).setValue(new Date());
  log_('COMPLETE_ACTIVITY', id, '', user.username);
  return { ok: true, activity: activityById_(id) };
}

function listActivities_() {
  const sh = getSS_().getSheetByName(DL.SHEETS.KEGIATAN);
  if (!sh) throw new Error('SHEET_KEGIATAN_NOT_FOUND');
  const activities = rowsAsObjects_(sh);
  console.log('DokuLap listActivities: ' + activities.length + ' kegiatan');
  return { ok: true, activities: activities };
}

function activityById_(id) {
  const sh = getSS_().getSheetByName(DL.SHEETS.KEGIATAN);
  const rows = rowsAsObjects_(sh);
  return rows.find(r => r.kegiatan_id === id) || null;
}

/* ---------------- UPLOAD ---------------- */

function uploadFile_(body, user) {
  const activityId = String(body.kegiatan_id || '');
  if (!activityId) throw new Error('KEGIATAN_ID_REQUIRED');

  const activity = activityById_(activityId);
  if (!activity) throw new Error('KEGIATAN_NOT_FOUND');
  if (activity.status === 'Selesai') throw new Error('ACTIVITY_COMPLETED');

  const b64 = String(body.base64 || '');
  const mime = String(body.mime_type || 'application/octet-stream');
  const originalName = String(body.nama_file || 'file');
  if (!b64) throw new Error('FILE_DATA_REQUIRED');

  const bytes = Utilities.base64Decode(b64);
  if (bytes.length > DL.MAX_FILE_BYTES) {
    throw new Error('FILE_TOO_LARGE: maksimal ' + Math.round(DL.MAX_FILE_BYTES / 1024 / 1024) + ' MB pada Backend v1.');
  }

  const type = normalizeType_(mime);
  const activityFolder = DriveApp.getFolderById(activity.drive_folder_id);
  const subFolderName = type === 'Foto' ? 'Foto' : type === 'Video' ? 'Video' : type === 'Dokumen' ? 'Dokumen' : 'Lainnya';
  const folder = getOrCreateFolder_(subFolderName, activityFolder);

  const safeName = sanitizeName_(originalName);
  const blob = Utilities.newBlob(bytes, mime, safeName);
  const file = folder.createFile(blob);

  const id = 'DOC-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  getSS_().getSheetByName(DL.SHEETS.DOKUMENTASI).appendRow([
    id, activityId, type, file.getName(), file.getId(), file.getUrl(),
    '', mime, bytes.length, body.keterangan || '', new Date(), 'Berhasil'
  ]);

  log_('UPLOAD', activityId, id, user.username + ' | ' + file.getName());

  return {
    ok: true,
    document: {
      dokumentasi_id: id,
      kegiatan_id: activityId,
      jenis_file: type,
      nama_file: file.getName(),
      file_id: file.getId(),
      file_url: file.getUrl(),
      ukuran: bytes.length,
      status: 'Berhasil'
    }
  };
}

function listDocuments_() {
  const sh = getSS_().getSheetByName(DL.SHEETS.DOKUMENTASI);
  return { ok: true, documents: rowsAsObjects_(sh) };
}

function deleteDocument_(body, user) {
  const id = String(body.dokumentasi_id || '');
  const sh = getSS_().getSheetByName(DL.SHEETS.DOKUMENTASI);
  const row = findRowById_(DL.SHEETS.DOKUMENTASI, id);
  if (!row) throw new Error('DOCUMENT_NOT_FOUND');

  const vals = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];
  const fileId = String(vals[4] || '');
  if (fileId) DriveApp.getFileById(fileId).setTrashed(true);
  sh.getRange(row, 12).setValue('Dihapus');
  log_('DELETE_DOCUMENT', String(vals[1]), id, user.username);
  return { ok: true, dokumentasi_id: id, status: 'Dihapus' };
}

/* ---------------- HELPERS ---------------- */

function getSS_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return SpreadsheetApp.openById(id);
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  else {
    const current = sh.getRange(1,1,1,headers.length).getValues()[0];
    headers.forEach((h,i) => { if (current[i] !== h) sh.getRange(1,i+1).setValue(h); });
  }
  sh.setFrozenRows(1);
}

function getOrCreateFolder_(name, parent) {
  const folder = parent ? parent : DriveApp;
  const it = folder.getFoldersByName(name);
  return it.hasNext() ? it.next() : folder.createFolder(name);
}

function getYearFolder_(year) {
  const rootId = PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID');
  const root = DriveApp.getFolderById(rootId);
  return getOrCreateFolder_(year, root);
}

function upsertSetting_(sh, key, value) {
  const data = sh.getDataRange().getValues();
  for (let i=1;i<data.length;i++) {
    if (String(data[i][0]) === key) { sh.getRange(i+1,2).setValue(value); return; }
  }
  sh.appendRow([key,value]);
}

function rowsAsObjects_(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  // Use display values so the API always returns JSON-safe strings.
  // This avoids serialization problems caused by Date/error/formula values
  // in Google Sheets.
  const data = sh.getDataRange().getDisplayValues();
  const headers = data[0].map(h => String(h || '').trim());
  return data.slice(1).filter(r => r.some(v => String(v || '').trim() !== '')).map(r => {
    const o = {};
    headers.forEach((h,i) => {
      if (h) o[h] = String(r[i] == null ? '' : r[i]);
    });
    return o;
  });
}

function findRowById_(sheetName, id) {
  const sh = getSS_().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return 0;
  const vals = sh.getRange(2,1,sh.getLastRow()-1,1).getValues();
  for (let i=0;i<vals.length;i++) if (String(vals[i][0]) === id) return i+2;
  return 0;
}

function log_(activity, kegiatanId, docId, note) {
  const sh = getSS_().getSheetByName(DL.SHEETS.LOG);
  if (!sh) return;
  sh.appendRow(['LOG-' + Utilities.getUuid().slice(0,8).toUpperCase(), new Date(), activity, kegiatanId || '', docId || '', note || '']);
}

function normalizeType_(mime) {
  if (mime.indexOf('image/') === 0) return 'Foto';
  if (mime.indexOf('video/') === 0) return 'Video';
  if (mime === 'application/pdf' || mime.indexOf('text/') === 0 || mime.indexOf('application/vnd') === 0) return 'Dokumen';
  return 'Lainnya';
}

function sanitizeName_(name) {
  return String(name).replace(/[\\/:*?"<>|#%{}]/g, '_').slice(0, 180);
}

function sha256_(text) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
