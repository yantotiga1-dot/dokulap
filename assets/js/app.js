window.DokuLap={
showToast(message,type=''){const t=document.createElement('div');t.className='toast '+type;t.textContent=message;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)},
layout(active,content,title,subtitle=''){
return `<div class="app-shell"><aside class="sidebar"><div class="sidebar-brand"><div class="brand-mark">DL</div><div><b>DokuLap</b><small class="muted" style="display:block">Dokumentasi Lapangan</small></div></div><nav class="nav">
<a class="${active==='dashboard'?'active':''}" href="dashboard.html">📊 Dashboard</a>
<a class="${active==='kegiatan'?'active':''}" href="kegiatan.html">📋 Kegiatan</a>
<a class="${active==='dokumentasi'?'active':''}" href="dokumentasi.html">📁 Dokumentasi</a>
<a href="#">🏫 Sekolah / Lokasi</a><a class="${active==='analisis'?'active':''}" href="analisis.html">📈 Analisis</a><a class="${active==='laporan'?'active':''}" href="laporan.html">📄 Laporan</a><a href="#">⚙️ Pengaturan</a>
</nav></aside><main class="main"><header class="topbar"><div><h1 class="page-title">${title}</h1><div class="muted">${subtitle}</div></div><div class="topbar-actions"><button class="icon-btn" title="Ganti tema" onclick="toggleTheme()">☼</button><button class="btn btn-primary desktop-only" onclick="location.href='kegiatan.html#buat'">+ Kegiatan</button><button class="btn btn-secondary desktop-only" onclick="dokuLogout()">Keluar</button><div class="avatar">T</div></div></header>${content}</main><nav class="bottom-nav"><a href="dashboard.html" class="${active==='dashboard'?'active':''}"><span>🏠</span>Home</a><a href="kegiatan.html" class="${active==='kegiatan'?'active':''}"><span>📋</span>Aktif</a><a href="dokumentasi.html" class="${active==='dokumentasi'?'active':''}"><span>📷</span>Doku</a><a href="analisis.html" class="${active==='analisis'?'active':''}"><span>📊</span>Analisis</a><a href="#"><span>☰</span>Menu</a></nav></div>`},
statCard(num,label,icon){return `<div class="card stat"><span class="stat-icon">${icon}</span><div class="num">${num}</div><div class="label">${label}</div></div>`}
};
document.addEventListener('click',e=>{const btn=e.target.closest('[data-toggle-password]');if(btn){const i=document.getElementById('password');i.type=i.type==='password'?'text':'password'}});
window.toggleTheme=function(){const dark=document.documentElement.getAttribute('data-theme')==='dark';document.documentElement.setAttribute('data-theme',dark?'light':'dark');localStorage.setItem('dokulap-theme',dark?'light':'dark')};
(()=>{const saved=localStorage.getItem('dokulap-theme');if(saved)document.documentElement.setAttribute('data-theme',saved)})();

if(!localStorage.getItem('dokulap-token') && location.pathname.split('/').pop()!=='index.html' && location.pathname.split('/').pop()!==''){ location.href='index.html'; }
window.dokuLogout=function(){DokuAPI.logout();location.href='index.html'};
