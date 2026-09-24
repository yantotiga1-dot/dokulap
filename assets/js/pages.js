
const page=document.body.dataset.page;const A=DokuLap;
const state={activities:[],docs:[],schools:[]};

async function getCoreData(){
  const [a,d,s]=await Promise.all([DokuAPI.activities(),DokuAPI.documents(),DokuAPI.schools()]);
  state.activities=a.activities||[];state.docs=d.documents||[];state.schools=s.schools||[];
  return state;
}
function statusBadge(s){return `<span class="badge ${s==='Aktif'?'badge-success':s==='Selesai'?'badge-gray':'badge-warning'}">${A.escape(s||'-')}</span>`}
function typeIcon(t){return t==='Foto'?'📷':t==='Video'?'🎥':t==='Dokumen'?'📄':'📎'}
function schoolName(id){return state.schools.find(s=>s.sekolah_id===id)?.nama_sekolah||id||'Lokasi umum'}
function monthKey(date){const d=new Date(date);return Number.isNaN(d.getTime())?null:d.getMonth()}
function countBy(arr,key){return arr.reduce((o,x)=>{const k=x[key]||'Lainnya';o[k]=(o[k]||0)+1;return o},{})}
function emptyState(icon,title,text,button=''){return `<div class="empty"><div class="empty-icon">${icon}</div><b>${A.escape(title)}</b><p class="muted">${A.escape(text)}</p>${button}</div>`}

async function dashboard(){
 document.getElementById('app').innerHTML=A.layout('dashboard',`<div class="skeleton skeleton-box" style="height:110px;margin-bottom:18px"></div><div class="stats">${[1,2,3,4].map(()=>`<div class="card stat"><div class="skeleton skeleton-line" style="width:45%"></div><div class="skeleton skeleton-line" style="width:70%;height:28px"></div></div>`).join('')}</div>`,'Dashboard','Ringkasan aktivitas dan dokumentasi Anda');
 try{
  await A.runLoading('Memuat dashboard...',getCoreData);
  const active=state.activities.find(x=>x.status==='Aktif');
  const months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],now=new Date(),monthly=months.map((_,i)=>state.docs.filter(d=>{const x=new Date(d.timestamp);return x.getFullYear()===now.getFullYear()&&x.getMonth()===i}).length);
  const max=Math.max(...monthly,1),photo=state.docs.filter(d=>d.jenis_file==='Foto').length;
  const typeCounts=countBy(state.docs,'jenis_file'),topSchool=Object.entries(countBy(state.activities,'sekolah_id')).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('app').innerHTML=A.layout('dashboard',`
  <section class="hero-strip"><div class="hero-copy"><div class="eyebrow">FIELD MODE</div><h2>${active?'Kegiatan aktif siap didokumentasikan':'Belum ada kegiatan aktif'}</h2><p>${active?A.escape(active.nama_kegiatan)+' · '+A.escape(schoolName(active.sekolah_id)): 'Mulai dengan membuat kegiatan baru agar setiap upload otomatis terhubung.'}</p></div><div class="form-row"><button class="btn btn-primary" onclick="location.href='kegiatan.html#buat'">＋ Buat Kegiatan</button>${active?`<button class="btn btn-secondary" onclick="location.href='dokumentasi.html'">📷 Dokumentasi</button>`:''}</div></section>
  <div class="stats">${A.statCard(state.activities.length,'Kegiatan','📋')}${A.statCard(state.docs.length,'Dokumentasi','📁')}${A.statCard(state.schools.length,'Sekolah','🏫')}${A.statCard(photo,'Foto','📷')}</div>
  <div class="grid-2"><section class="card panel"><div class="panel-head"><h3 class="panel-title">📋 Kegiatan Aktif</h3>${active?statusBadge('Aktif'):''}</div>${active?`<div class="activity-card"><div class="activity-title">${A.escape(active.nama_kegiatan)}</div><div class="activity-meta">🏫 ${A.escape(schoolName(active.sekolah_id))} · ${A.fmtDate(active.tanggal_mulai)}</div><div class="muted">ID: ${A.escape(active.kegiatan_id)}</div><div class="form-actions"><button class="btn btn-primary" onclick="location.href='kegiatan.html'">Buka Kegiatan</button></div></div>`:emptyState('📋','Belum ada kegiatan aktif','Buat kegiatan baru untuk memulai dokumentasi.','<button class="btn btn-primary" onclick="location.href=\'kegiatan.html#buat\'">＋ Buat Kegiatan</button>')}</section>
  <section class="card panel"><div class="panel-head"><h3 class="panel-title">⚡ Aksi Cepat</h3></div><div class="quick-actions"><button class="btn btn-primary" onclick="location.href='kegiatan.html#buat'">＋ Kegiatan</button><button class="btn btn-secondary" onclick="location.href='dokumentasi.html'">📁 Dokumentasi</button><button class="btn btn-secondary" onclick="location.href='sekolah.html'">🏫 Sekolah</button><button class="btn btn-secondary" onclick="location.href='analisis.html'">📈 Insight</button></div></section></div>
  <div class="grid-2"><section class="card panel"><div class="panel-head"><h3 class="panel-title">Dokumentasi per Bulan</h3><span class="muted">${now.getFullYear()}</span></div><div class="chart">${monthly.map((v,i)=>`<div class="bar" style="height:${Math.max(8,v/max*100)}%"><span>${v}</span></div>`).join('')}</div><div class="chart-labels">${months.map(m=>`<span>${m}</span>`).join('')}</div></section>
  <section class="card panel"><div class="panel-head"><h3 class="panel-title">💡 Insight Cepat</h3></div><div class="insight">📷 Foto menyumbang <b>${state.docs.length?Math.round(photo/state.docs.length*100):0}%</b> dari seluruh dokumentasi.</div><div class="insight">📊 Jenis dokumentasi dominan: <b>${Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'-'}</b>.</div><div class="insight">🏫 Aktivitas terbanyak: <b>${topSchool?A.escape(schoolName(topSchool[0])):'belum ada'}</b>.</div></section></div>
  <section class="card panel" style="margin-top:18px"><div class="panel-head"><h3 class="panel-title">Kegiatan Terbaru</h3><a class="link" href="kegiatan.html">Lihat semua →</a></div><div class="table-wrap">${state.activities.length?`<table class="table"><thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Sekolah</th><th>Status</th><th>Doku</th></tr></thead><tbody>${state.activities.slice().reverse().slice(0,8).map(k=>`<tr><td>${A.fmtDate(k.tanggal_mulai)}</td><td><b>${A.escape(k.nama_kegiatan)}</b></td><td>${A.escape(schoolName(k.sekolah_id))}</td><td>${statusBadge(k.status)}</td><td>${state.docs.filter(d=>d.kegiatan_id===k.kegiatan_id).length}</td></tr>`).join('')}</tbody></table>`:emptyState('📋','Belum ada kegiatan','Kegiatan yang dibuat akan muncul di sini.')}</div></section>`,
  'Ringkasan aktivitas dan dokumentasi Anda');
 }catch(e){document.getElementById('app').innerHTML=A.layout('dashboard',emptyState('⚠️','Dashboard belum dapat dimuat',e.message,'<button class="btn btn-primary" onclick="location.reload()">↻ Coba Lagi</button>'),'Dashboard','Periksa koneksi backend');}
}

async function kegiatan(){
 document.getElementById('app').innerHTML=A.layout('kegiatan',`<section class="card panel"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-box"></div></section>`,'Kegiatan','Buat, aktifkan, dan selesaikan kegiatan');
 try{
  await A.runLoading('Memuat kegiatan...',async()=>{const [a,s,d]=await Promise.all([DokuAPI.activities(),DokuAPI.schools(),DokuAPI.documents()]);state.activities=a.activities||[];state.schools=s.schools||[];state.docs=d.documents||[]});
  const activeId0=localStorage.getItem('dokulap-active-activity')||'';const active=state.activities.find(x=>x.status==='Aktif')||state.activities.find(x=>x.kegiatan_id===activeId0);
  renderKegiatan(active);
 }catch(e){renderKegiatan(null,e)}
}
function renderKegiatan(active,error=''){
 const schoolOptions=state.schools.map(s=>`<option value="${A.escape(s.sekolah_id)}">${A.escape(s.nama_sekolah)}</option>`).join('');
 document.getElementById('app').innerHTML=A.layout('kegiatan',`
 <section id="buat" class="card panel"><div class="panel-head"><div><div class="eyebrow">NEW ACTIVITY</div><h3 class="panel-title">Buat Kegiatan</h3></div><span class="badge badge-blue">Kegiatan → Dokumentasi</span></div>
 <div class="form-grid"><label>Nama Kegiatan *<input id="kNama" placeholder="Contoh: Monitoring Pembelajaran"></label><label>Jenis Kegiatan *<select id="kJenis"><option>Monitoring</option><option>Evaluasi</option><option>Supervisi</option><option>Observasi</option><option>Kunjungan</option><option>Verifikasi</option><option>Survey</option><option>Lainnya</option></select></label>
 <label>Sekolah / Lokasi *<select id="kSekolah"><option value="">Pilih sekolah / lokasi</option>${schoolOptions}</select></label><label>Tanggal *<input id="kTanggal" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Lokasi<input id="kLokasi" placeholder="Kecamatan / alamat"></label><label>Deskripsi<textarea id="kDeskripsi" rows="3" placeholder="Catatan singkat kegiatan"></textarea></label></div>
 <div class="form-actions"><button class="btn btn-secondary" onclick="location.href='dashboard.html'">Batal</button><button id="saveActivity" class="btn btn-primary">✓ Simpan & Mulai</button></div></section>
 <section class="card panel" style="margin-top:18px"><div class="panel-head"><div><div class="eyebrow">FIELD MODE</div><h3 class="panel-title">Kegiatan Aktif</h3></div>${active?statusBadge('Aktif'):'<span class="badge badge-gray">Tidak ada</span>'}</div>
 <div id="activeActivity">${active?activeActivityHTML(active):emptyState('📋','Belum ada kegiatan aktif','Buat kegiatan untuk mengaktifkan mode lapangan.')}</div></section>
 <section class="card panel" style="margin-top:18px"><div class="panel-head"><div><div class="eyebrow">CAPTURE</div><h3 class="panel-title">Upload Dokumentasi</h3></div><span class="muted">Maks. 8 MB / file pada backend v1</span></div>
 <div class="dropzone" id="quickDrop"><div class="drop-icon">📷</div><h3>Quick Capture</h3><p class="muted">Pilih foto, video, atau dokumen. Konteks kegiatan aktif diterapkan otomatis.</p><div class="form-row" style="justify-content:center;flex-wrap:wrap"><label class="btn btn-primary" style="margin:0">Pilih File<input id="realUpload" type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" capture="environment" style="display:none"></label><button class="btn btn-secondary" id="cameraBtn">📷 Kamera</button></div></div>
 <label>Keterangan<input id="uploadNote" placeholder="Opsional"></label><div id="uploadQueue"></div></section>
 <section class="card panel" style="margin-top:18px"><div class="panel-head"><h3 class="panel-title">Semua Kegiatan</h3><span class="muted">${state.activities.length} kegiatan</span></div><div class="table-wrap">${state.activities.length?`<table class="table"><thead><tr><th>Kegiatan</th><th>Sekolah</th><th>Tanggal</th><th>Status</th><th>Doku</th></tr></thead><tbody>${state.activities.slice().reverse().map(k=>`<tr><td><b>${A.escape(k.nama_kegiatan)}</b><br><small class="muted">${A.escape(k.kegiatan_id)}</small></td><td>${A.escape(schoolName(k.sekolah_id))}</td><td>${A.fmtDate(k.tanggal_mulai)}</td><td>${statusBadge(k.status)}</td><td>${state.docs.filter(d=>d.kegiatan_id===k.kegiatan_id).length}</td></tr>`).join('')}</tbody></table>`:emptyState('📋','Belum ada kegiatan','Buat kegiatan pertama Anda di formulir atas.')}</div></section>`,
 'Buat, aktifkan, lalu dokumentasikan kegiatan tanpa mengisi konteks berulang');
 bindKegiatan(active);
}
function activeActivityHTML(active){return `<div class="activity-card"><div class="activity-title">${A.escape(active.nama_kegiatan)}</div><div class="activity-meta">🏫 ${A.escape(schoolName(active.sekolah_id))} · ${A.fmtDate(active.tanggal_mulai)}</div><div class="muted">ID: ${A.escape(active.kegiatan_id)}</div><div class="kpi-row"><span class="mini-kpi">📷 <b>${state.docs.filter(d=>d.kegiatan_id===active.kegiatan_id&&d.jenis_file==='Foto').length}</b> Foto</span><span class="mini-kpi">🎥 <b>${state.docs.filter(d=>d.kegiatan_id===active.kegiatan_id&&d.jenis_file==='Video').length}</b> Video</span><span class="mini-kpi">📄 <b>${state.docs.filter(d=>d.kegiatan_id===active.kegiatan_id&&d.jenis_file==='Dokumen').length}</b> Dokumen</span></div><div class="form-actions"><button class="btn btn-primary" onclick="location.href='dokumentasi.html'">📷 Lihat Dokumentasi</button><button class="btn btn-secondary" onclick="completeActiveActivity()">✓ Selesaikan</button></div></div>`}
function bindKegiatan(active){
 const btn=document.getElementById('saveActivity');btn.onclick=async()=>{
  const nama=document.getElementById('kNama').value.trim(),school=document.getElementById('kSekolah').value;
  if(!nama||!school)return A.showToast('Nama kegiatan dan sekolah wajib diisi.','warning');
  btn.disabled=true;btn.innerHTML='<span class="spinner" style="width:16px;height:16px;border-width:2px;margin:0"></span> Menyimpan...';
  try{const r=await DokuAPI.createActivity({nama_kegiatan:nama,jenis_kegiatan:document.getElementById('kJenis').value,sekolah_id:school,tanggal_mulai:document.getElementById('kTanggal').value,lokasi:document.getElementById('kLokasi').value,deskripsi:document.getElementById('kDeskripsi').value});localStorage.setItem('dokulap-active-activity',r.activity.kegiatan_id);A.showToast('Kegiatan berhasil disimpan dan aktif','success');state.activities.unshift(r.activity);renderKegiatan(r.activity);document.getElementById('activeActivity')?.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){A.showToast(e.message,'error')}finally{btn.disabled=false}
 };
 const input=document.getElementById('realUpload'),queue=document.getElementById('uploadQueue'),drop=document.getElementById('quickDrop');
 input.addEventListener('change',()=>quickUpload([...input.files]));document.getElementById('cameraBtn').onclick=()=>input.click();
 ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag')}));drop.addEventListener('drop',e=>quickUpload([...e.dataTransfer.files]));
 async function quickUpload(files){
  const id=localStorage.getItem('dokulap-active-activity');if(!id)return A.showToast('Buat kegiatan aktif terlebih dahulu.','warning');if(!files.length)return;
  queue.innerHTML='';for(const [i,file] of files.entries()){const row=document.createElement('div');row.className='insight';row.innerHTML=`<b>${A.escape(file.name)}</b><div class="progress"><div class="progress-bar"></div></div><small class="muted">Menyiapkan...</small>`;queue.appendChild(row);try{const bar=row.querySelector('.progress-bar'),s=row.querySelector('small');await DokuAPI.uploadFile(file,id,document.getElementById('uploadNote').value,p=>{bar.style.width=Math.min(96,p*2)+'%';s.textContent=p<50?'Membaca file...':'Mengirim ke Google Drive...'});bar.style.width='100%';s.textContent='✓ Berhasil';s.className='success';A.showToast(file.name+' tersimpan','success')}catch(e){row.querySelector('small').textContent='Gagal: '+e.message;A.showToast('Upload gagal: '+file.name,'error')}}input.value='';}
}
window.completeActiveActivity=async()=>{const id=localStorage.getItem('dokulap-active-activity');if(!id)return;try{await DokuAPI.completeActivity(id);localStorage.removeItem('dokulap-active-activity');A.showToast('Kegiatan selesai','success');kegiatan()}catch(e){A.showToast(e.message,'error')}};

async function dokumentasi(){
 document.getElementById('app').innerHTML=A.layout('dokumentasi',`<div class="stats">${[1,2,3,4].map(()=>`<div class="card stat"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line" style="height:26px"></div></div>`).join('')}</div>`,'Dokumentasi','Cari, filter, preview, dan kelola seluruh dokumentasi');
 try{await A.runLoading('Memuat dokumentasi...',async()=>{state.docs=(await DokuAPI.documents()).documents||[];state.activities=(await DokuAPI.activities()).activities||[];state.schools=(await DokuAPI.schools()).schools||[]});renderDocs();}
 catch(e){document.getElementById('app').innerHTML=A.layout('dokumentasi',emptyState('⚠️','Dokumentasi belum dapat dimuat',e.message,'<button class="btn btn-primary" onclick="location.reload()">↻ Coba Lagi</button>'),'Dokumentasi','Kelola file yang tersimpan di Google Drive');}
}
function renderDocs(){
 const types=['Semua jenis','Foto','Video','Dokumen','Lainnya'],schools=['Semua sekolah',...state.schools.map(s=>s.nama_sekolah)];
 const counts=['Foto','Video','Dokumen','Lainnya'].map(t=>state.docs.filter(d=>d.jenis_file===t).length);
 document.getElementById('app').innerHTML=A.layout('dokumentasi',`
 <div class="toolbar"><input id="docSearch" placeholder="🔎 Cari file, kegiatan, sekolah..."><select id="docType">${types.map(t=>`<option>${t}</option>`).join('')}</select><select id="docSchool">${schools.map(t=>`<option>${A.escape(t)}</option>`).join('')}</select><button class="btn btn-primary" onclick="DokuComponents.openUpload()">＋ Upload</button></div>
 <div class="stats" style="margin-bottom:18px">${A.statCard(state.docs.length,'Semua','📁')}${A.statCard(counts[0],'Foto','📷')}${A.statCard(counts[1],'Video','🎥')}${A.statCard(counts[2],'Dokumen','📄')}</div>
 <div id="docGrid" class="cards"></div>`,
 'Cari, filter, preview, dan kelola seluruh dokumentasi');
 const apply=()=>{const q=document.getElementById('docSearch').value.toLowerCase(),t=document.getElementById('docType').value,s=document.getElementById('docSchool').value;
  const arr=state.docs.filter(d=>(!q||[d.nama_file,d.keterangan,d.jenis_file,schoolName((state.activities.find(a=>a.kegiatan_id===d.kegiatan_id)||{}).sekolah_id)].join(' ').toLowerCase().includes(q))&& (t==='Semua jenis'||d.jenis_file===t)&&(s==='Semua sekolah'||schoolName((state.activities.find(a=>a.kegiatan_id===d.kegiatan_id)||{}).sekolah_id)===s));
  document.getElementById('docGrid').innerHTML=arr.length?arr.slice().reverse().map(docCard).join(''):emptyState('📁','Tidak ada dokumentasi','Coba ubah kata kunci atau filter.');
 };
 ['docSearch','docType','docSchool'].forEach(id=>document.getElementById(id).addEventListener('input',apply));apply();
}
function docCard(d){
 const img=d.jenis_file==='Foto'&&d.file_id?`<img src="https://drive.google.com/thumbnail?id=${encodeURIComponent(d.file_id)}&sz=w700" alt="" loading="lazy" onerror="this.style.display='none'">`:typeIcon(d.jenis_file);
 const a=state.activities.find(x=>x.kegiatan_id===d.kegiatan_id),school=schoolName(a?.sekolah_id);
 return `<article class="card doc-card"><div class="thumb">${img}</div><div class="doc-body"><div class="doc-title" title="${A.escape(d.nama_file)}">${A.escape(d.nama_file)}</div><div class="doc-meta">${typeIcon(d.jenis_file)} ${A.escape(d.jenis_file)} · ${A.fmtBytes(d.ukuran)}<br>📋 ${A.escape(a?.nama_kegiatan||d.kegiatan_id)}<br>🏫 ${A.escape(school)} · ${A.fmtDate(d.timestamp)}</div><div class="doc-actions"><button class="btn btn-secondary" onclick='DokuComponents.preview(${JSON.stringify(d).replace(/'/g,"&#039;")})'>Preview</button><a class="btn btn-primary" target="_blank" href="${A.escape(d.file_url||'#')}">Drive</a><button class="btn btn-danger" onclick="deleteDoc('${A.escape(d.dokumentasi_id)}')">Hapus</button></div></div></article>`;
}
window.deleteDoc=async id=>{if(!confirm('Hapus dokumentasi ini dari Drive dan tandai sebagai dihapus?'))return;try{await DokuAPI.deleteDocument(id);state.docs=state.docs.filter(d=>d.dokumentasi_id!==id);renderDocs();A.showToast('Dokumentasi dihapus','success')}catch(e){A.showToast(e.message,'error')}};

async function sekolah(){
 document.getElementById('app').innerHTML=A.layout('sekolah',`<div class="card panel"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-box"></div></div>`,'Sekolah / Lokasi','Kelola sekolah dan lihat riwayat aktivitas');
 try{await A.runLoading('Memuat sekolah...',async()=>{state.schools=(await DokuAPI.schools()).schools||[];state.activities=(await DokuAPI.activities()).activities||[];state.docs=(await DokuAPI.documents()).documents||[]});renderSekolah();}
 catch(e){document.getElementById('app').innerHTML=A.layout('sekolah',emptyState('⚠️','Data sekolah belum dapat dimuat',e.message,'<button class="btn btn-primary" onclick="location.reload()">↻ Coba Lagi</button>'),'Sekolah / Lokasi','Kelola data lokasi kegiatan');}
}
function renderSekolah(){
 document.getElementById('app').innerHTML=A.layout('sekolah',`
 <div class="hero-strip"><div class="hero-copy"><div class="eyebrow">LOCATION MASTER</div><h2>Daftar Sekolah / Lokasi</h2><p>Gunakan data sekolah sebagai konteks kegiatan dan analisis.</p></div><button class="btn btn-primary" onclick="openSchoolForm()">＋ Tambah Sekolah</button></div>
 <div class="school-grid">${state.schools.length?state.schools.map(schoolCard).join(''):emptyState('🏫','Belum ada sekolah','Tambahkan sekolah pertama Anda.')}</div>
 <div class="card panel" style="margin-top:18px"><div class="panel-head"><h3 class="panel-title">Riwayat Aktivitas per Sekolah</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Sekolah</th><th>Kegiatan</th><th>Dokumentasi</th><th>Terakhir</th></tr></thead><tbody>${state.schools.map(s=>{const acts=state.activities.filter(a=>a.sekolah_id===s.sekolah_id);const docs=state.docs.filter(d=>acts.some(a=>a.kegiatan_id===d.kegiatan_id));return `<tr><td><b>${A.escape(s.nama_sekolah)}</b></td><td>${acts.length}</td><td>${docs.length}</td><td>${acts.length?A.fmtDate(acts.map(a=>a.tanggal_mulai).sort().reverse()[0]):'-'}</td></tr>`}).join('')}</tbody></table></div></div>`,
 'Kelola data sekolah dan lokasi kegiatan');
}
function schoolCard(s){
 const acts=state.activities.filter(a=>a.sekolah_id===s.sekolah_id),docs=state.docs.filter(d=>acts.some(a=>a.kegiatan_id===d.kegiatan_id));
 return `<article class="card school-card"><div class="school-icon">🏫</div><b>${A.escape(s.nama_sekolah)}</b><div class="muted" style="font-size:12px;margin-top:5px">${A.escape(s.kecamatan||s.alamat||'Lokasi belum diisi')}</div><div class="kpi-row"><span class="mini-kpi">Kegiatan <b>${acts.length}</b></span><span class="mini-kpi">Dokumentasi <b>${docs.length}</b></span></div><div class="form-actions"><button class="btn btn-secondary" onclick="openSchoolForm('${A.escape(s.sekolah_id)}')">Edit</button><button class="btn btn-danger" onclick="removeSchool('${A.escape(s.sekolah_id)}')">Hapus</button></div></article>`;
}
window.openSchoolForm=function(id=''){
 const s=state.schools.find(x=>x.sekolah_id===id)||{};
 document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="schoolModal"><section class="modal"><header class="modal-head"><b>${id?'Edit Sekolah':'Tambah Sekolah'}</b><button class="icon-btn" onclick="document.getElementById('schoolModal').remove()">✕</button></header><div class="modal-body"><div class="form-grid"><label>Nama Sekolah *<input id="sNama" value="${A.escape(s.nama_sekolah||'')}"></label><label>Kecamatan<input id="sKec" value="${A.escape(s.kecamatan||'')}"></label><label class="full-field">Alamat<input id="sAlamat" value="${A.escape(s.alamat||'')}"></label><label>Latitude<input id="sLat" value="${A.escape(s.latitude||'')}"></label><label>Longitude<input id="sLng" value="${A.escape(s.longitude||'')}"></label><label class="full-field">Catatan<textarea id="sCat" rows="3">${A.escape(s.catatan||'')}</textarea></label></div></div><footer class="modal-foot"><button class="btn btn-secondary" onclick="document.getElementById('schoolModal').remove()">Batal</button><button class="btn btn-primary" id="schoolSave">Simpan</button></footer></section></div>`);
 document.getElementById('schoolSave').onclick=async()=>{const btn=document.getElementById('schoolSave'),name=document.getElementById('sNama').value.trim();if(!name)return A.showToast('Nama sekolah wajib diisi','warning');btn.disabled=true;btn.textContent='Menyimpan...';const payload={sekolah_id:id,nama_sekolah:name,kecamatan:document.getElementById('sKec').value,alamat:document.getElementById('sAlamat').value,latitude:document.getElementById('sLat').value,longitude:document.getElementById('sLng').value,catatan:document.getElementById('sCat').value};try{const r=id?await DokuAPI.updateSchool(payload):await DokuAPI.createSchool(payload);const school=r.school;if(id){state.schools=state.schools.map(x=>x.sekolah_id===id?school:x)}else state.schools.unshift(school);document.getElementById('schoolModal').remove();renderSekolah();A.showToast('Data sekolah tersimpan','success')}catch(e){A.showToast(e.message,'error')}finally{btn.disabled=false}};
}
window.removeSchool=async id=>{const used=state.activities.some(a=>a.sekolah_id===id);if(used)return A.showToast('Sekolah sudah dipakai kegiatan dan tidak dapat dihapus.','warning');if(!confirm('Hapus sekolah ini?'))return;try{await DokuAPI.deleteSchool(id);state.schools=state.schools.filter(s=>s.sekolah_id!==id);renderSekolah();A.showToast('Sekolah dihapus','success')}catch(e){A.showToast(e.message,'error')}};

async function analisis(){
 document.getElementById('app').innerHTML=A.layout('analisis',`<div class="stats">${[1,2,3,4].map(()=>`<div class="card stat"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line" style="height:26px"></div></div>`).join('')}`,'Analisis & Insight','Lihat pola kegiatan dan dokumentasi berdasarkan data nyata');
 try{await A.runLoading('Mengolah data...',getCoreData);renderAnalisis();}
 catch(e){document.getElementById('app').innerHTML=A.layout('analisis',emptyState('⚠️','Analisis belum dapat dimuat',e.message,'<button class="btn btn-primary" onclick="location.reload()">↻ Coba Lagi</button>'),'Analisis & Insight','Berbasis data DokuLap');}
}
function renderAnalisis(){
 const now=new Date(),months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
 const m=months.map((_,i)=>state.docs.filter(d=>{const x=new Date(d.timestamp);return x.getFullYear()===now.getFullYear()&&x.getMonth()===i}).length),max=Math.max(...m,1);
 const byType=countBy(state.docs,'jenis_file'),byKind=countBy(state.activities,'jenis_kegiatan'),bySchool=countBy(state.activities,'sekolah_id');
 const topType=Object.entries(byType).sort((a,b)=>b[1]-a[1])[0],topKind=Object.entries(byKind).sort((a,b)=>b[1]-a[1])[0],topSchool=Object.entries(bySchool).sort((a,b)=>b[1]-a[1])[0];
 document.getElementById('app').innerHTML=A.layout('analisis',`
 <div class="stats">${A.statCard(state.activities.length,'Kegiatan','📋')}${A.statCard(state.docs.length,'Dokumentasi','📁')}${A.statCard(state.docs.filter(d=>d.jenis_file==='Foto').length,'Foto','📷')}${A.statCard(state.docs.filter(d=>d.jenis_file==='Video').length,'Video','🎥')}</div>
 <div class="grid-2"><section class="card panel"><div class="panel-head"><h3 class="panel-title">📈 Dokumentasi per Bulan</h3><span class="badge badge-blue">${now.getFullYear()}</span></div><div class="chart">${m.map(v=>`<div class="bar" style="height:${Math.max(8,v/max*100)}%"><span>${v}</span></div>`).join('')}</div><div class="chart-labels">${months.map(x=>`<span>${x}</span>`).join('')}</div></section>
 <section class="card panel"><div class="panel-head"><h3 class="panel-title">💡 Insight</h3></div><div class="insight">Jenis dokumentasi dominan: <b>${A.escape(topType?.[0]||'-')}</b> (${topType?.[1]||0}).</div><div class="insight">Jenis kegiatan paling sering: <b>${A.escape(topKind?.[0]||'-')}</b> (${topKind?.[1]||0}).</div><div class="insight">Sekolah dengan aktivitas terbanyak: <b>${A.escape(schoolName(topSchool?.[0]||''))}</b>.</div><div class="insight">Rata-rata dokumentasi per kegiatan: <b>${state.activities.length?(state.docs.length/state.activities.length).toFixed(1):0}</b>.</div></section></div>
 <div class="grid-2"><section class="card panel"><div class="panel-head"><h3 class="panel-title">Komposisi Dokumentasi</h3></div>${Object.entries(byType).length?Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="insight">${typeIcon(k)} ${A.escape(k)} <b style="float:right">${v} · ${Math.round(v/state.docs.length*100)}%</b></div>`).join(''):emptyState('📁','Belum ada data','Upload dokumentasi untuk membentuk analisis.')}</section>
 <section class="card panel"><div class="panel-head"><h3 class="panel-title">Jenis Kegiatan</h3></div>${Object.entries(byKind).length?Object.entries(byKind).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="insight">📋 ${A.escape(k)} <b style="float:right">${v}</b></div>`).join(''):emptyState('📋','Belum ada kegiatan','Buat kegiatan untuk melihat distribusi.')}</section></div>`,
 'Statistik dan insight berbasis data DokuLap');
}

async function laporan(){
  document.getElementById('app').innerHTML=A.layout('laporan',
    `<section class="card panel">${emptyState('📄','Laporan','Modul laporan tetap tersedia pada tahap berikutnya. Gunakan Analisis untuk ringkasan data saat ini.','')}<div class="form-actions"><button class="btn btn-primary" onclick="location.href='analisis.html'">Buka Analisis</button></div></section>`,
    'Laporan','Laporan akan dikembangkan setelah modul 1–5 stabil');
}
if(page==='dashboard')dashboard();if(page==='kegiatan')kegiatan();if(page==='dokumentasi')dokumentasi();if(page==='sekolah')sekolah();if(page==='analisis')analisis();if(page==='laporan')laporan();
