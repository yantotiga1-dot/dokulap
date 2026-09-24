
window.DokuLap={
  escape(value){
    return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  },
  fmtDate(v){
    if(!v)return '-';
    const d=new Date(v);
    if(Number.isNaN(d.getTime()))return this.escape(v);
    return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
  },
  fmtBytes(n){
    n=Number(n)||0;if(n<1024)return n+' B';if(n<1024*1024)return (n/1024).toFixed(1)+' KB';return (n/1024/1024).toFixed(1)+' MB';
  },
  showToast(message,type='info'){
    const icons={success:'✓',error:'!',warning:'⚠',info:'i'};
    const t=document.createElement('div');t.className='toast '+type;t.innerHTML=`<b>${icons[type]||'i'}</b><span>${this.escape(message)}</span>`;
    document.body.appendChild(t);setTimeout(()=>t.remove(),3200);
  },
  loading(show,text='Memproses...'){
    let el=document.getElementById('globalLoading');
    if(show){
      if(!el){document.body.insertAdjacentHTML('beforeend',`<div id="globalLoading" class="loading-overlay"><div class="loading-box"><div class="spinner"></div><b id="globalLoadingText">${this.escape(text)}</b><div class="muted" style="font-size:12px;margin-top:6px">Mohon tunggu sebentar</div></div></div>`)}
      else{el.style.display='grid';document.getElementById('globalLoadingText').textContent=text}
    }else if(el)el.remove();
  },
  async runLoading(text,fn){
    this.loading(true,text);try{return await fn()}finally{this.loading(false)}
  },
  statCard(num,label,icon){return `<div class="card stat"><span class="stat-icon">${icon}</span><div class="num">${this.escape(num)}</div><div class="label">${this.escape(label)}</div></div>`},
  layout(active,content,title,subtitle=''){
    const user=JSON.parse(localStorage.getItem('dokulap-user')||'{}');
    const initial=(user.username||'T').charAt(0).toUpperCase();
    return `<div class="app-shell"><aside class="sidebar">
      <div class="sidebar-brand"><div class="brand-mark">DL</div><div><b>DokuLap</b><small class="muted" style="display:block">Dokumentasi Lapangan</small></div></div>
      <nav class="nav">
        <a class="${active==='dashboard'?'active':''}" href="dashboard.html">📊 Dashboard</a>
        <a class="${active==='kegiatan'?'active':''}" href="kegiatan.html">📋 Kegiatan</a>
        <a class="${active==='dokumentasi'?'active':''}" href="dokumentasi.html">📁 Dokumentasi</a>
        <a class="${active==='sekolah'?'active':''}" href="sekolah.html">🏫 Sekolah / Lokasi</a>
        <a class="${active==='analisis'?'active':''}" href="analisis.html">📈 Analisis & Insight</a>
        <a class="${active==='laporan'?'active':''}" href="laporan.html">📄 Laporan</a>
      </nav>
      <div class="sidebar-footer"><button class="btn btn-secondary full" onclick="toggleTheme()">☼ &nbsp; Tema</button><button class="btn btn-ghost full" style="margin-top:7px" onclick="dokuLogout()">↪ Keluar</button></div>
    </aside>
    <main class="main"><header class="topbar"><div><div class="eyebrow">DOKULAP</div><h1 class="page-title">${this.escape(title)}</h1><div class="muted">${this.escape(subtitle)}</div></div>
      <div class="topbar-actions"><button class="icon-btn" title="Tema" onclick="toggleTheme()">☼</button><button class="btn btn-primary desktop-only" onclick="location.href='kegiatan.html#buat'">＋ Kegiatan</button><div class="avatar">${initial}</div><button class="icon-btn mobile-menu-btn" onclick="openMobileMenu()">☰</button></div>
    </header><div class="page-enter">${content}</div></main>
    <nav class="bottom-nav">
      <a href="dashboard.html" class="${active==='dashboard'?'active':''}"><span>🏠</span>Home</a>
      <a href="kegiatan.html" class="${active==='kegiatan'?'active':''}"><span>📋</span>Aktif</a>
      <a href="dokumentasi.html" class="${active==='dokumentasi'?'active':''}"><span>📷</span>Doku</a>
      <a href="sekolah.html" class="${active==='sekolah'?'active':''}"><span>🏫</span>Sekolah</a>
      <a href="analisis.html" class="${active==='analisis'?'active':''}"><span>📊</span>Analisis</a>
    </nav></div>`;
  }
};
window.toggleTheme=function(){const dark=document.documentElement.getAttribute('data-theme')==='dark';document.documentElement.setAttribute('data-theme',dark?'light':'dark');localStorage.setItem('dokulap-theme',dark?'light':'dark')};
window.openMobileMenu=function(){
  if(document.getElementById('mobileDrawer'))return;
  document.body.insertAdjacentHTML('beforeend',`<div class="mobile-drawer" id="mobileDrawer" onclick="if(event.target===this)closeMobileMenu()"><aside class="drawer"><div class="form-row between"><div class="brand-name">DokuLap</div><button class="icon-btn" onclick="closeMobileMenu()">✕</button></div><div class="drawer-links">
  <a href="dashboard.html">📊 Dashboard</a><a href="kegiatan.html">📋 Kegiatan</a><a href="dokumentasi.html">📁 Dokumentasi</a><a href="sekolah.html">🏫 Sekolah / Lokasi</a><a href="analisis.html">📈 Analisis & Insight</a><a href="laporan.html">📄 Laporan</a></div><button class="btn btn-secondary full" style="margin-top:20px" onclick="toggleTheme()">☼ Tema</button><button class="btn btn-danger full" style="margin-top:8px" onclick="dokuLogout()">↪ Keluar</button></aside></div>`);
};
window.closeMobileMenu=function(){document.getElementById('mobileDrawer')?.remove()};
window.dokuLogout=function(){DokuAPI.logout();location.href='index.html'};
(()=>{const saved=localStorage.getItem('dokulap-theme');if(saved)document.documentElement.setAttribute('data-theme',saved)})();
if(!localStorage.getItem('dokulap-token') && !['index.html',''].includes(location.pathname.split('/').pop()))location.href='index.html';
