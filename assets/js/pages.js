const page=document.body.dataset.page;const A=DokuLap;
function dashboard(){const s=MOCK.stats;document.getElementById('app').innerHTML=A.layout('dashboard',`
<div class="stats">${A.statCard(s.kegiatan,'Kegiatan','📋')}${A.statCard(s.dokumentasi,'Dokumentasi','📷')}${A.statCard(s.sekolah,'Sekolah','🏫')}${A.statCard(s.bulan,'Bulan Aktif','📅')}</div>
<div class="grid-2"><section class="card panel"><div class="panel-head"><h3 class="panel-title">🔴 Kegiatan Aktif</h3><span class="badge badge-success">Aktif</span></div><div class="activity-card"><div class="activity-title">Monitoring Pembelajaran</div><div class="activity-meta">🏫 SD Negeri 01 · 24 September 2026</div><div class="muted">📷 12 &nbsp; 🎥 2 &nbsp; 📄 1</div><div class="form-row" style="margin-top:15px"><button class="btn btn-primary" onclick="location.href='kegiatan.html'">Buka Kegiatan</button><button class="btn btn-secondary" onclick="DokuLap.showToast('Kegiatan ditandai selesai','success')">Selesaikan</button></div></div></section>
<section class="card panel"><div class="panel-head"><h3 class="panel-title">⚡ Quick Action</h3></div><div class="quick-actions"><button class="btn btn-primary" onclick="location.href='kegiatan.html#buat'">+ Kegiatan</button><button class="btn btn-secondary" onclick="location.href='dokumentasi.html'">📷 Dokumentasi</button></div></section></div>
<div class="grid-2"><section class="card panel"><div class="panel-head"><h3 class="panel-title">Aktivitas Dokumentasi</h3><span class="muted">2026</span></div><div class="chart"><div class="bar" style="height:40%"><span>42</span></div><div class="bar" style="height:60%"><span>68</span></div><div class="bar" style="height:52%"><span>57</span></div><div class="bar" style="height:78%"><span>91</span></div><div class="bar" style="height:66%"><span>75</span></div><div class="bar" style="height:92%"><span>104</span></div></div><div class="chart-labels"><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span><span>Agu</span><span>Sep</span></div></section>
<section class="card panel"><div class="panel-head"><h3 class="panel-title">💡 Insight</h3></div><div class="insight">📈 <b>9 kegiatan</b> terdokumentasi bulan ini.</div><div class="insight">📷 Foto merupakan jenis dokumentasi terbanyak.</div><div class="insight">🏫 SD Negeri 01 memiliki aktivitas tertinggi.</div></section></div>
<section class="card panel" style="margin-top:18px"><div class="panel-head"><h3 class="panel-title">Kegiatan Terbaru</h3><a class="link" href="kegiatan.html">Lihat semua →</a></div><div class="table-wrap"><table class="table"><thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Sekolah</th><th>Status</th><th>Dokumentasi</th></tr></thead><tbody>${MOCK.kegiatan.map(k=>`<tr><td>${k.date}</td><td><b>${k.title}</b></td><td>${k.school}</td><td><span class="badge ${k.status==='Aktif'?'badge-success':'badge-gray'}">${k.status}</span></td><td>📷 ${k.foto} · 🎥 ${k.video} · 📄 ${k.dokumen}</td></tr>`).join('')}</tbody></table></div></section>`,'Ringkasan aktivitas dan dokumentasi Anda');}
function kegiatan(){
document.getElementById('app').innerHTML=A.layout('kegiatan',`
<section id="buat" class="card panel">
 <div class="panel-head"><h3 class="panel-title">Buat Kegiatan</h3><span class="badge badge-blue">Kegiatan aktif menjadi konteks upload</span></div>
 <div class="form-grid">
  <label>Nama Kegiatan *<input id="kNama" placeholder="Contoh: Monitoring Pembelajaran"></label>
  <label>Jenis Kegiatan *<select id="kJenis"><option>Monitoring</option><option>Evaluasi</option><option>Supervisi</option><option>Observasi</option><option>Kunjungan</option><option>Lainnya</option></select></label>
  <label>Sekolah / Lokasi *<input id="kSekolah" placeholder="Contoh: SD Negeri 01"></label>
  <label>Tanggal *<input id="kTanggal" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
  <label>Lokasi<input id="kLokasi" placeholder="Kecamatan / alamat"></label>
  <label>Deskripsi<textarea id="kDeskripsi" rows="3" placeholder="Catatan singkat kegiatan"></textarea></label>
 </div>
 <div class="form-actions"><button class="btn btn-secondary" onclick="location.href='dashboard.html'">Batal</button><button id="saveActivity" class="btn btn-primary">Simpan & Mulai Kegiatan</button></div>
</section>
<section class="card panel" style="margin-top:18px">
 <div class="panel-head"><h3 class="panel-title">Kegiatan Aktif</h3><span id="activeStatus" class="badge badge-success">Memuat...</span></div>
 <div id="activeActivity" class="activity-card"><div class="muted">Memuat data backend...</div></div>
</section>
<section class="card panel" style="margin-top:18px">
 <div class="panel-head"><h3 class="panel-title">Upload Dokumentasi</h3><span class="muted">File masuk Drive + metadata ke Sheets</span></div>
 <div class="form-grid">
  <label>File<input id="realUpload" type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"></label>
  <label>Keterangan<input id="uploadNote" placeholder="Opsional"></label>
 </div>
 <div id="uploadQueue" style="margin-top:14px"></div>
 <button id="uploadBtn" class="btn btn-primary" style="margin-top:12px">☁ Upload ke Google Drive</button>
</section>
<section class="card panel" style="margin-top:18px"><div class="panel-head"><h3 class="panel-title">Daftar Kegiatan</h3></div><div id="activityTable" class="table-wrap"><div class="muted">Memuat...</div></div></section>`,
'Buat, aktifkan, lalu dokumentasikan kegiatan tanpa mengisi konteks berulang');

let activeId=localStorage.getItem('dokulap-active-activity')||'';

async function refresh(){
 try{
  const data=await DokuAPI.activities();
  const list=data.activities||[];
  const active=list.find(x=>x.status==='Aktif')||list.find(x=>x.kegiatan_id===activeId);
  if(active) { activeId=active.kegiatan_id; localStorage.setItem('dokulap-active-activity',activeId); }
  document.getElementById('activeStatus').textContent=active?'Aktif':'Belum ada';
  document.getElementById('activeActivity').innerHTML=active?
   `<div class="activity-title">${active.nama_kegiatan}</div><div class="activity-meta">🏫 ${active.lokasi||active.sekolah_id||'-'} · ${active.tanggal_mulai}</div><div class="muted">ID: ${active.kegiatan_id}</div><div class="form-row" style="margin-top:15px"><button class="btn btn-secondary" onclick="completeActiveActivity()">Selesaikan</button></div>`:
   `<div class="muted">Belum ada kegiatan aktif. Buat kegiatan di atas.</div>`;
  document.getElementById('activityTable').innerHTML=`<table class="table"><thead><tr><th>Kegiatan</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>${list.map(k=>`<tr><td><b>${k.nama_kegiatan}</b><br><small class="muted">${k.kegiatan_id}</small></td><td>${k.tanggal_mulai||''}</td><td><span class="badge ${k.status==='Aktif'?'badge-success':'badge-gray'}">${k.status}</span></td></tr>`).join('')}</tbody></table>`;
 }catch(e){ document.getElementById('activeActivity').innerHTML='<div class="muted">Backend belum tersambung: '+e.message+'</div>'; }
}
document.getElementById('saveActivity').onclick=async()=>{
 const btn=document.getElementById('saveActivity'); btn.disabled=true; btn.textContent='Menyimpan...';
 try{
  const r=await DokuAPI.createActivity({nama_kegiatan:document.getElementById('kNama').value,jenis_kegiatan:document.getElementById('kJenis').value,sekolah_nama:document.getElementById('kSekolah').value,tanggal_mulai:document.getElementById('kTanggal').value,lokasi:document.getElementById('kLokasi').value,deskripsi:document.getElementById('kDeskripsi').value});
  activeId=r.activity.kegiatan_id; localStorage.setItem('dokulap-active-activity',activeId); DokuLap.showToast('Kegiatan aktif dibuat','success'); await refresh();
 }catch(e){DokuLap.showToast(e.message,'error')} finally{btn.disabled=false;btn.textContent='Simpan & Mulai Kegiatan';}
};
document.getElementById('uploadBtn').onclick=async()=>{
 const input=document.getElementById('realUpload'), queue=document.getElementById('uploadQueue'), files=[...input.files];
 if(!activeId) return DokuLap.showToast('Buat/aktifkan kegiatan terlebih dahulu','error');
 if(!files.length) return DokuLap.showToast('Pilih file terlebih dahulu','error');
 queue.innerHTML='';
 for(const file of files){
  const row=document.createElement('div'); row.className='insight'; row.innerHTML=`<b>${file.name}</b><div class="progress"><div class="progress-bar" style="width:0%"></div></div><small class="muted">Menyiapkan...</small>`; queue.appendChild(row);
  try{
   const bar=row.querySelector('.progress-bar'), status=row.querySelector('small');
   const result=await DokuAPI.uploadFile(file,activeId,document.getElementById('uploadNote').value,p=>{bar.style.width=Math.min(50,p)+'%';});
   bar.style.width='100%'; status.textContent='Berhasil masuk Google Drive'; status.className='success';
   DokuLap.showToast(file.name+' berhasil diupload','success');
  }catch(e){row.querySelector('small').textContent='Gagal: '+e.message; DokuLap.showToast('Upload gagal: '+file.name,'error');}
 }
 input.value='';
};
window.completeActiveActivity=async()=>{
 if(!activeId)return;
 try{await DokuAPI.completeActivity(activeId);localStorage.removeItem('dokulap-active-activity');DokuLap.showToast('Kegiatan selesai','success');refresh();}catch(e){DokuLap.showToast(e.message,'error')}
};
refresh();
}
function dokumentasi(){document.getElementById('app').innerHTML=A.layout('dokumentasi',`
<div class="toolbar"><input placeholder="🔎 Cari nama file, kegiatan, sekolah..."><select><option>Semua jenis</option><option>Foto</option><option>Video</option><option>Dokumen</option></select><select><option>Semua sekolah</option>${MOCK.schools.map(x=>`<option>${x}</option>`).join('')}</select><button class="btn btn-primary" onclick="DokuComponents.openUpload()">+ Upload</button></div>
<div class="cards">${MOCK.docs.map(d=>`<article class="card doc-card"><div class="thumb">${d.icon}</div><div class="doc-body"><div class="doc-title">${d.name}</div><div class="doc-meta">${d.activity}<br>${d.school} · ${d.date}</div><div class="doc-actions"><button class="btn btn-secondary" onclick='DokuComponents.preview(${JSON.stringify(d)})'>Preview</button><button class="btn btn-primary" onclick="DokuLap.showToast('Membuka Google Drive')">Drive</button></div></div></article>`).join('')}</div>`,'Cari, filter, preview, dan kelola seluruh dokumentasi');}
function analisis(){document.getElementById('app').innerHTML=A.layout('analisis',`
<div class="stats">${A.statCard(28,'Kegiatan','📋')}${A.statCard(486,'Dokumentasi','📷')}${A.statCard(320,'Foto','🖼️')}${A.statCard(98,'Video','🎥')}</div>
<div class="grid-2"><section class="card panel"><div class="panel-head"><h3 class="panel-title">Dokumentasi per Bulan</h3><select style="width:auto;margin:0"><option>2026</option></select></div><div class="chart"><div class="bar" style="height:35%"></div><div class="bar" style="height:48%"></div><div class="bar" style="height:42%"></div><div class="bar" style="height:62%"></div><div class="bar" style="height:70%"></div><div class="bar" style="height:90%"></div></div><div class="chart-labels"><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span><span>Agu</span><span>Sep</span></div></section><section class="card panel"><h3 class="panel-title">💡 Insight</h3><div class="insight">Aktivitas dokumentasi meningkat pada September.</div><div class="insight">Foto adalah kategori dominan.</div><div class="insight">Monitoring menjadi jenis kegiatan paling sering.</div></section></div>
<section class="card panel" style="margin-top:18px"><h3 class="panel-title">Komposisi Dokumentasi</h3><div class="insight">Foto <b style="float:right">320 · 66%</b></div><div class="insight">Video <b style="float:right">98 · 20%</b></div><div class="insight">Dokumen <b style="float:right">68 · 14%</b></div></section>`,'Statistik dan insight berbasis data DokuLap');}
function laporan(){document.getElementById('app').innerHTML=A.layout('laporan',`
<section class="card panel"><div class="panel-head"><h3 class="panel-title">Generate Laporan</h3><span class="badge badge-blue">Preview sebelum export</span></div><label>Pilih kegiatan<select><option>Monitoring Pembelajaran — SD Negeri 01 — 24 Sep 2026</option><option>Evaluasi Program Sekolah — SD Negeri 02 — 20 Sep 2026</option></select></label><div class="form-actions"><button class="btn btn-secondary" onclick="DokuLap.showToast('Preview laporan siap')">👁 Preview</button><button class="btn btn-primary" onclick="DokuLap.showToast('Generator PDF akan tersedia pada tahap backend','success')">📄 Generate PDF</button></div></section>
<section class="card panel" style="margin-top:18px;max-width:850px"><div style="text-align:center"><div class="brand-name">DokuLap</div><div class="muted">Dokumentasi Lapangan</div><h2>LAPORAN DOKUMENTASI KEGIATAN</h2></div><hr><p><b>Monitoring Pembelajaran</b></p><p class="muted">24 September 2026 · SD Negeri 01 · Mojolaban</p><h3>Ringkasan</h3><p>Dokumentasi kegiatan monitoring pembelajaran dengan 12 foto, 2 video, dan 1 dokumen pendukung.</p><h3>Dokumentasi</h3><div class="cards"><div class="thumb">📷</div><div class="thumb">📷</div><div class="thumb">📷</div></div></section>`,'Buat laporan kegiatan dari data yang sudah terekap');}
if(page==='dashboard')dashboard();if(page==='kegiatan')kegiatan();if(page==='dokumentasi')dokumentasi();if(page==='analisis')analisis();if(page==='laporan')laporan();