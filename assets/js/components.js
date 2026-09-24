
window.DokuComponents={
  uploadModal(){
    return `<div class="modal-backdrop" id="uploadModal"><section class="modal"><header class="modal-head"><div><b>Upload Dokumentasi</b><div class="muted" style="font-size:12px">Kegiatan aktif akan otomatis menjadi konteks upload.</div></div><button class="icon-btn" onclick="DokuComponents.closeModal()">✕</button></header>
    <div class="modal-body"><div class="dropzone" id="dropzone"><div class="drop-icon">☁️</div><h3>Tarik & lepas file di sini</h3><p class="muted">atau pilih dari perangkat</p><div class="form-row" style="justify-content:center;flex-wrap:wrap"><label class="btn btn-primary" style="margin:0">Pilih File<input id="fileInput" type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" capture="environment" style="display:none"></label><button class="btn btn-secondary" onclick="DokuComponents.camera()">📷 Kamera</button></div></div><div id="fileList" class="file-list"></div><label>Keterangan (opsional)<textarea id="modalUploadNote" rows="3" placeholder="Catatan dokumentasi..."></textarea></div>
    <footer class="modal-foot"><button class="btn btn-secondary" onclick="DokuComponents.closeModal()">Batal</button><button class="btn btn-primary" onclick="DokuComponents.realUpload()">☁ Upload</button></footer></section></div>`;
  },
  closeModal(){document.getElementById('uploadModal')?.remove()},
  camera(){document.getElementById('fileInput')?.click()},
  openUpload(){document.body.insertAdjacentHTML('beforeend',this.uploadModal());this.bindUploader()},
  bindUploader(){
    const z=document.getElementById('dropzone'),i=document.getElementById('fileInput');
    ['dragenter','dragover'].forEach(e=>z.addEventListener(e,x=>{x.preventDefault();z.classList.add('drag')}));
    ['dragleave','drop'].forEach(e=>z.addEventListener(e,x=>{x.preventDefault();z.classList.remove('drag')}));
    z.addEventListener('drop',e=>this.files([...e.dataTransfer.files]));i.addEventListener('change',e=>this.files([...e.target.files]));
  },
  files(files){
    this.selected=files;const l=document.getElementById('fileList');
    l.innerHTML=files.map((f,n)=>`<div class="file-item"><span>${f.type.startsWith('video')?'🎥':f.type.startsWith('image')?'📷':'📄'}</span><div class="file-info"><b>${DokuLap.escape(f.name)}</b><div class="muted" style="font-size:11px">${DokuLap.fmtBytes(f.size)}</div><div class="progress"><div class="progress-bar" id="mp${n}"></div></div></div><span class="muted" id="ms${n}">Siap</span></div>`).join('');
  },
  async realUpload(){
    if(!this.selected?.length)return DokuLap.showToast('Pilih file terlebih dahulu','error');
    const activityId=localStorage.getItem('dokulap-active-activity');if(!activityId)return DokuLap.showToast('Belum ada kegiatan aktif','error');
    const note=document.getElementById('modalUploadNote')?.value||'';const files=this.selected;
    const btn=document.querySelector('#uploadModal .modal-foot .btn-primary');btn.disabled=true;btn.textContent='Mengupload...';
    let success=0;
    for(let n=0;n<files.length;n++){
      const f=files[n],bar=document.getElementById('mp'+n),status=document.getElementById('ms'+n);
      try{await DokuAPI.uploadFile(f,activityId,note,p=>{bar.style.width=Math.min(96,p*2)+'%'});bar.style.width='100%';status.textContent='Berhasil';status.className='success';success++;}
      catch(e){status.textContent='Gagal';status.className='badge badge-danger';}
    }
    btn.disabled=false;btn.textContent='Upload';if(success)DokuLap.showToast(`${success} file berhasil diupload`,'success');if(success===files.length)this.closeModal();
  },
  preview(doc){
    const type=doc.jenis_file||doc.type;const isImage=type==='Foto'||String(doc.mime_type||'').startsWith('image/');
    const media=isImage&&doc.file_id?`<img class="preview-media" src="https://drive.google.com/thumbnail?id=${encodeURIComponent(doc.file_id)}&sz=w1200" alt="">`:type==='Video'&&doc.file_url?`<div class="empty"><div class="empty-icon">🎥</div><b>Video tersimpan di Google Drive</b><p class="muted">Gunakan tombol Buka Drive untuk memutar video.</p></div>`:`<div class="empty"><div class="empty-icon">📄</div><b>Dokumen tersimpan di Google Drive</b></div>`;
    document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="previewModal"><section class="modal large"><header class="modal-head"><div><b>${DokuLap.escape(doc.nama_file||doc.name||'Dokumentasi')}</b><div class="muted">${DokuLap.escape(type||'File')}</div></div><button class="icon-btn" onclick="DokuComponents.closePreview()">✕</button></header><div class="modal-body">${media}<div class="modal-note">${DokuLap.escape(doc.keterangan||'Tidak ada keterangan')}</div><div class="form-actions"><a class="btn btn-primary" target="_blank" href="${DokuLap.escape(doc.file_url||'#')}">↗ Buka Google Drive</a></div></div></section></div>`);
  },
  closePreview(){document.getElementById('previewModal')?.remove()}
};
